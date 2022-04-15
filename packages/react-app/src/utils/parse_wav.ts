/*
 * @Author: Kanata You 
 * @Date: 2022-04-14 23:01:26 
 * @Last Modified by: Kanata You
 * @Last Modified time: 2022-04-15 23:45:16
 */

const FREQ_SPANS = 64;
const FRAME_PER_SEC = 30;

const FREQ_HEIGHT = 256;
const WAVE_HEIGHT = 128;

const HALF_PX = 0.5 / window.devicePixelRatio;

export type WavFrameData = {
  /** 时域声强数据：[max, min] */
  peak: [number, number];
  /**
   * 频域音高数据.
   * @see https://developer.mozilla.org/zh-CN/docs/Web/API/AnalyserNode/getByteFrequencyData#%E4%BE%8B%E5%AD%90
   */
  frequency: Uint8Array;
};

export type WavChannelData = WavFrameData[];

export type WavData = WavChannelData[];

const decodeWav = async (
  data: ArrayBuffer
): Promise<{
  channels: WavData;
  duration: number;
} | null> => {
  const ac = new AudioContext();
  const offlineAc = new OfflineAudioContext(1, 2, ac.sampleRate);

  if (data.byteLength === 0) {
    return null;
  }

  const [decodeErr, decodedData] = await offlineAc.decodeAudioData(data).then(
    d => [null, d]
  ).catch(
    e => [e, null]
  ) as ([Error, null] | [null, AudioBuffer]);
  
  if (decodeErr) {
    console.error('decode error:', decodeErr);
    return null;
  }

  const buffer = decodedData as AudioBuffer;

  const size = Math.round(
    buffer.duration * FRAME_PER_SEC
  );

  const frameToTime = (frameId: number) => frameId * buffer.duration / size / sampleSize;

  const sampleSize = buffer.length / size;
  const sampleStep = ((sampleSize / 10) | 1) || 1; // int

  const wavData: WavData = [];

  for (let cid = 0; cid < buffer.numberOfChannels; cid += 1) {
    const channel = buffer.getChannelData(cid);

    const channelData: WavChannelData = [];

    for (let i = 0; i < size; i += 1) {
      const start = Math.floor(i * sampleSize);
      const end = Math.floor(start + sampleSize);
      const nFrames = end - start;
      const center = Math.round((start + end - sampleStep) / 2);

      // 音频片段源节点，只能调用一次 start()，所以需要在循环内创建，代价低
      const source = ac.createBufferSource();
      source.buffer = ac.createBuffer(1, nFrames, ac.sampleRate);
      source.buffer.copyToChannel(channel.subarray(start, end), 0);
      // 分析结点
      const analyser = ac.createAnalyser();
      // analyser.fftSize = 512;
      analyser.minDecibels = -85;
      analyser.maxDecibels = -30;
      // @see http://www.qiutianaimeili.com/html/page/2018/02/t9xhq1gd8c.html
      // 默认 0.8
      analyser.smoothingTimeConstant = 0.85;
      // analyser.connect(ac.destination); // FIXME: 不用播放
      source.connect(analyser);

      source.start(0);
      
      const frameData: WavFrameData = {
        peak: [0, 0],
        frequency: new Uint8Array(analyser.frequencyBinCount)
      };

      // 统计声强
      const _t = new Uint8Array(analyser.fftSize);
      analyser.getByteTimeDomainData(_t);

      const c = source.buffer.getChannelData(0);

      let min = c[0] as number;
      let max = min;
      
      for (let j = 0; j < nFrames; j += sampleStep) {
        const value = c[j] as number;

        if (value > max) {
          max = value;
        }

        if (value < min) {
          min = value;
        }
      }

      frameData.peak = [max, min];

      // 统计频率
      
      analyser.getByteFrequencyData(frameData.frequency);
      (window as any).a = () => {
        const d = new Uint8Array(analyser.frequencyBinCount);
      
        analyser.getByteFrequencyData(d);

        return d;
      }

      if (cid === 0 && i % 500 === 0) {
        console.log(
          i,
          nFrames,
          _t.length,
          frameData.peak,
          (() => {
            const d: Record<number, number> = {};
            _t.forEach(e => {
              d[e] = (d[e] ?? 0) + 1;
            });

            return d;
          })(),
          frameData.frequency.length,
          (() => {
            const d: Record<number, number> = {};
            frameData.frequency.forEach(e => {
              d[e] = (d[e] ?? 0) + 1;
            });

            return d;
          })(),
        );
      }
      
      source.stop();

      // 记录当前帧

      channelData.push(frameData);
    }
    
    wavData.push(channelData);
  }

  return {
    channels: wavData,
    duration: buffer.duration
  };
};

const parseWav = async (data: ArrayBuffer): Promise<{
  channels: WavData;
  duration: number;
} | null> => {
  const res = await decodeWav(data);

  return res;
};

const drawFreq = async (
  ctx: CanvasRenderingContext2D,
  width: number,
  frequencies: Uint8Array[],
  length: number
): Promise<void> => {
  const freqBinCount = frequencies[0]?.length ?? 1;

  const RECT_WIDTH = (width - 1) / (length + 2);
  const RECT_HEIGHT = FREQ_HEIGHT / freqBinCount;

  const fx = (x: number) => x * RECT_WIDTH;
  const fy = (freqIdx: number) => freqIdx * RECT_HEIGHT;
  const colorize = (val: number) => `rgb(${val / 128 + 100},50,50)`;

  const STEP = Math.floor(freqBinCount / FREQ_SPANS);

  const tasks: Promise<void>[] = [];

  for (let i = 0; i < frequencies.length; i += 1) {
    const frequency = frequencies[i] as Uint8Array;

    for (let freqIdx = 0; freqIdx < freqBinCount; freqIdx += STEP) {
      const domain = frequency.subarray(
        freqIdx, Math.min(freqIdx + STEP, freqBinCount)
      );

      tasks.push(new Promise<void>(resolve => {
        requestAnimationFrame(() => {
          const value = domain.reduce<number>((val, v, _, { length }) => {
            return val + (Math.random() < 0.08 ? Math.floor(Math.random() * 128) : v) / length;
          }, 0);
    
          ctx.fillStyle = colorize(value);
          ctx.fillRect(fx(i), fy(freqIdx), RECT_WIDTH + HALF_PX, RECT_HEIGHT * domain.length + HALF_PX);

          resolve();
        });
      }));
    }
  }

  await Promise.all(tasks);
};

const drawPeaks = (
  ctx: CanvasRenderingContext2D,
  width: number,
  peaks: [number, number][],
  length: number
) => {
  const center = FREQ_HEIGHT + WAVE_HEIGHT / 2;
  const fx = (x: number) => x * (width - 1) / (length + 2);
  const fy = (y: number) => center - y * WAVE_HEIGHT / 2;

  ctx.beginPath();
  ctx.moveTo(0, center);

  ctx.lineTo(
    0,
    fy(peaks[0]?.[0] ?? 0)
  );

  // to right
  for (let i = 0; i < peaks.length + 1; i += 1) {
    const peakMax = peaks[i]?.[0] ?? 0;
    ctx.lineTo(fx(i) + HALF_PX, fy(peakMax));
  }
  
  // to left
  for (let j = peaks.length + 1; j >= 0; j -= 1) {
    const peakMin = peaks[j + 1]?.[1] ?? 0;
    ctx.lineTo(fx(j) + HALF_PX, fy(peakMin));
  }

  ctx.lineTo(
    0,
    fy(peaks[0]?.[1] ?? 0)
  );

  ctx.closePath();
  ctx.fill();
};

export const drawWavData = async (
  context: CanvasRenderingContext2D,
  wavData: WavData,
  width: number
) => {
  let resolve: () => void;

  const p = new Promise<void>(res => resolve = res);

  requestAnimationFrame(() => {
    const length = wavData.reduce<number>((max, channel) => {
      return Math.max(max, channel.length);
    }, 0);

    const WAVE_COLORS = ['#f88', '#88fa'];

    const tasks: Promise<void>[] = [];
    
    wavData.forEach((channel, i) => {
      // 绘制 channel 声强波形
      context.fillStyle = WAVE_COLORS[i % 2]!;
      drawPeaks(context, width, channel.map(c => c.peak), length);

      // 绘制频谱
      if (i === 0) {
        // FIXME:
        context.fillStyle = '#000';
        context.fillRect(0, 0, width, FREQ_HEIGHT);
        context.fillStyle = '#eee';
        tasks.push(
          drawFreq(context, width, channel.map(c => c.frequency), length)
        );
      }
    });

    Promise.all(tasks).then(resolve);
  });

  return p;
};


export default parseWav;

/*
 * @Author: Kanata You 
 * @Date: 2022-04-14 23:01:26 
 * @Last Modified by: Kanata You
 * @Last Modified time: 2022-04-15 02:23:37
 */

const FRAME_PER_SEC = 30;

const HEIGHT = 256;
const CENTER = 128;

const decodeWav = async (data: ArrayBuffer): Promise<{
  frames: number[][];
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

  const gainNode = ac.createGain();
  gainNode.connect(ac.destination);

  const analyser = ac.createAnalyser();
  analyser.connect(gainNode);

  const source = ac.createBufferSource();
  source.buffer = buffer;
  source.connect(analyser);

  const size = Math.round(
    buffer.duration * FRAME_PER_SEC
  );

  const sampleSize = buffer.length / size;
  const sampleStep = ((sampleSize / 10) | 1) || 1; // int

  const frames: number[][] = [];

  for (let cid = 0; cid < buffer.numberOfChannels; cid += 1) {
    const peaks: number[] = [];

    // fill border with 0
    peaks[2 * (size - 1)] = 0;
    peaks[2 * (size - 1) + 1] = 0;

    const channel = buffer.getChannelData(cid);

    for (let i = 0; i < size; i += 1) {
      const start = ~~(i * sampleSize);
      const end = ~~(start + sampleSize);

      let min = channel[start] as number;
      let max = min;
      
      for (let j = start; j < end; j += sampleStep) {
        const value = channel[j] as number;

        if (value > max) {
          max = value;
        }

        if (value < min) {
          min = value;
        }
      }

      peaks[2 * i] = max;
      peaks[2 * i + 1] = min;
    }
    
    frames.push(peaks);
  }

  return {
    frames,
    duration: buffer.duration
  };
};

const parseWav = async (data: ArrayBuffer) => {
  const frames = await decodeWav(data);

  return frames;
};

const drawLines = (
  ctx: CanvasRenderingContext2D,
  width: number,
  peaks: number[]
) => {
  const length = peaks.length / 2;

  const fx = (x: number) => x * (width - 1) / (length + 2);
  const fy = (y: number) => CENTER - y * HEIGHT / 2;

  ctx.beginPath();
  ctx.moveTo(0, CENTER);

  ctx.lineTo(
    0,
    fy(peaks[0] ?? 0)
  );

  const HALF_PX = 0.5 / window.devicePixelRatio;

  // to right
  for (let i = 0; i < length + 1; i += 1) {
    const peak = peaks[2 * i] ?? 0;
    ctx.lineTo(fx(i) + HALF_PX, fy(peak));
  }
  
  // to left
  for (let j = length + 1; j >= 0; j -= 1) {
    const peak = peaks[2 * j + 1] ?? 0;
    ctx.lineTo(fx(j) + HALF_PX, fy(peak));
  }

  ctx.lineTo(
    0,
    fy(peaks[1] ?? 0)
  );

  ctx.closePath();
  ctx.fill();
};

export const drawFrames = async (
  context: CanvasRenderingContext2D,
  frames: number[][],
  width: number
) => {
  let resolve: () => void;

  const p = new Promise<void>(res => resolve = res);

  requestAnimationFrame(() => {
    const channels = frames;

    const WAVE_COLORS = ['#f33', '#33f'];
    
    channels.forEach((peaks, i) => {
      // // Bar wave draws the bottom only as a reflection of the top,
      // // so we don't need negative values
      // const hasMinVals = peaks.some(val => val < 0);

      let _peaks = [...peaks];

      // if (!hasMinVals) {
      //   const reflectedPeaks: number[] = [];
        
      //   for (let i = 0; i < peaks.length; i++) {
      //     reflectedPeaks[2 * i] = peaks[i]!;
      //     reflectedPeaks[2 * i + 1] = -peaks[i]!;
      //   }

      //   _peaks = [...reflectedPeaks];
      // }

      context.fillStyle = WAVE_COLORS[i % 2]!;

      drawLines(context, width, _peaks);
    });

    resolve();
  });

  return p;
};


export default parseWav;

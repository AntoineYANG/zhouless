/*
 * @Author: Kanata You 
 * @Date: 2022-04-13 15:37:20 
 * @Last Modified by: Kanata You
 * @Last Modified time: 2022-04-13 15:44:13
 */

/**
 * 主要参考：
 * @see https://blog.csdn.net/u012663281/article/details/112919404?spm=1001.2101.3001.6661.1&utm_medium=distribute.pc_relevant_t0.none-task-blog-2%7Edefault%7ECTRLIST%7ERate-1.pc_relevant_paycolumn_v3&depth_1-utm_source=distribute.pc_relevant_t0.none-task-blog-2%7Edefault%7ECTRLIST%7ERate-1.pc_relevant_paycolumn_v3&utm_relevant_index=1
 */

/** */
const interleave = (inputL: Float32Array, inputR: Float32Array) => {
  const length = inputL.length + inputR.length;
  const result = new Float32Array(length);

  for (let index = 0, inputIndex = 0; index < length; inputIndex += 1) {
    result[index++] = inputL[inputIndex] as number;
    result[index++] = inputR[inputIndex] as number;
  }

  return result;
};

const writeString = (view: DataView, offset: number, str: string) => {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
};

const writeFloat32 = (output: DataView, offset: number, input: Float32Array) => {
  for (var i = 0; i < input.length; i++, offset += 4) {
    output.setFloat32(offset, input[i] as number, true)
  }
};

const floatTo16BitPCM = (output: DataView, offset: number, input: Float32Array) => {
  for (var i = 0; i < input.length; i++, offset += 2) {
    var s = Math.max(-1, Math.min(1, input[i] as number))
    output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true)
  }
};

const encodeWAV = (
  samples: Float32Array,
  format: 1 | 3,
  sampleRate: number,
  numChannels: number,
  bitDepth: 32 | 16
) => {
  var bytesPerSample = bitDepth / 8
  var blockAlign = numChannels * bytesPerSample

  var buffer = new ArrayBuffer(44 + samples.length * bytesPerSample)
  var view = new DataView(buffer)

  /* RIFF identifier */
  writeString(view, 0, 'RIFF')
  /* RIFF chunk length */
  view.setUint32(4, 36 + samples.length * bytesPerSample, true)
  /* RIFF type */
  writeString(view, 8, 'WAVE')
  /* format chunk identifier */
  writeString(view, 12, 'fmt ')
  /* format chunk length */
  view.setUint32(16, 16, true)
  /* sample format (raw) */
  view.setUint16(20, format, true)
  /* channel count */
  view.setUint16(22, numChannels, true)
  /* sample rate */
  view.setUint32(24, sampleRate, true)
  /* byte rate (sample rate * block align) */
  view.setUint32(28, sampleRate * blockAlign, true)
  /* block align (channel count * bytes per sample) */
  view.setUint16(32, blockAlign, true)
  /* bits per sample */
  view.setUint16(34, bitDepth, true)
  /* data chunk identifier */
  writeString(view, 36, 'data')
  /* data chunk length */
  view.setUint32(40, samples.length * bytesPerSample, true)
  if (format === 1) { // Raw PCM
    floatTo16BitPCM(view, 44, samples)
  } else {
    writeFloat32(view, 44, samples)
  }
  return buffer
};

const genWavFromBuffer = (buffer: AudioBuffer, opt: any = {}) => {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = opt.float32 ? 3 : 1;
  const bitDepth = format === 3 ? 32 : 16;

  const result = numChannels === 2
    ? interleave(buffer.getChannelData(0), buffer.getChannelData(1))
    : buffer.getChannelData(0);

  return encodeWAV(result, format, sampleRate, numChannels, bitDepth);
};


export default genWavFromBuffer;

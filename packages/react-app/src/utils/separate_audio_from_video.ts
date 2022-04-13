/*
 * @Author: Kanata You 
 * @Date: 2022-04-13 15:30:31 
 * @Last Modified by: Kanata You
 * @Last Modified time: 2022-04-13 23:27:01
 */

import genWavFromBuffer from './gen_wav_from_buffer';


/**
 * 从视频文件中分离得到原始音频.
 */
const separateAudioFromVideo = async (videoFile: File) => {
  try {
    console.log('videoToAudio file', videoFile)
    const fileData = new Blob([videoFile]);
    
    const arrayBuffer = await new Promise<ArrayBuffer>(resolve => {
      const reader = new FileReader();

      reader.onload = ()=> {
        const arrayBuffer = reader.result as ArrayBuffer;
        resolve(arrayBuffer);
      };

      reader.readAsArrayBuffer(fileData);
    });
    
    console.log('arrayBuffer', arrayBuffer)
    
    const audioContext = new window.AudioContext();
    const decodedAudioData = await audioContext.decodeAudioData(arrayBuffer)
    console.log('decodedAudioData', decodedAudioData);
    console.log('fileDuration', decodedAudioData.duration)

    const offlineAudioContext = new OfflineAudioContext(decodedAudioData.numberOfChannels, decodedAudioData.sampleRate * decodedAudioData.duration, decodedAudioData.sampleRate)
    const soundSource = offlineAudioContext.createBufferSource()
    soundSource.buffer = decodedAudioData
    soundSource.connect(offlineAudioContext.destination)
    soundSource.start()

    const renderedBuffer = await offlineAudioContext.startRendering()
    console.log('renderedBuffer', renderedBuffer) // outputs audiobuffer
    const wav = genWavFromBuffer(renderedBuffer);
    
    return wav;
  } catch (error) {
    // {code: 0, name: 'EncodingError', message: 'Unable to decode audio data'} Case：No audio in the video file ? Maybe
    console.log('videoToAudio error', error)
    return null
  } finally {
    console.log('videoToAudio finally')
  }
};


export default separateAudioFromVideo;

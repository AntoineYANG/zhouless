/*
 * @Author: Kanata You 
 * @Date: 2022-04-13 22:57:30 
 * @Last Modified by: Kanata You
 * @Last Modified time: 2022-04-14 00:15:30
 */

import React from 'react';
import styled from 'styled-components';

import type { Playable } from '@components/media-group';


const AudioPlayerElement = styled.audio({

});

export interface AudioPlayerProps {
  url: string;
  subscribe: (item: Playable) => void;
  unsubscribe: (item: Playable) => void;
}

/**
 * 音频媒体控件.
 */
const AudioPlayer: React.FC<AudioPlayerProps> = ({
  url,
  subscribe,
  unsubscribe
}) => {
  const [player, setPlayer] = React.useState<HTMLAudioElement>();

  React.useEffect(() => {
    if (!player) {
      return;
    }

    const item: Playable = {
      name: 'audio-player',
      play() {
        player.play();
      },
      pause() {
        player.pause();
      },
      setTime(time: number) {
        player.currentTime = time;
      }
    };

    subscribe(item);

    return () => {
      unsubscribe(item);
    }
  }, [player]);

  return (
    <AudioPlayerElement
      src={url}
      ref={e => e && setPlayer(e)}
    />
  );
};


export default AudioPlayer;
 
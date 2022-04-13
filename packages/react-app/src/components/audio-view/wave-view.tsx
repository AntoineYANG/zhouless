/*
 * @Author: Kanata You 
 * @Date: 2022-04-13 23:23:53 
 * @Last Modified by: Kanata You
 * @Last Modified time: 2022-04-14 00:48:25
 */

import React from 'react';
import styled from 'styled-components';
import WaveSurfer from 'wavesurfer.js';

import type { EditorContext } from '@views';
import type { Playable } from '@components/media-group';


const WaveViewElement = styled.div({
  width: '100%',
  height: '120px',
  color: '#aaa',
  border: '1px solid',
});

export interface WaveViewProps {
  context: React.Context<EditorContext>;
  subscribe: (item: Playable) => void;
  unsubscribe: (item: Playable) => void;
  setTime: (time: number) => void;
}

/**
 * 波形显示.
 */
const WaveView: React.FC<WaveViewProps> = ({
  context,
  subscribe,
  unsubscribe,
  setTime
}) => {
  const [container, setContainer] = React.useState<HTMLDivElement>();
  const playerRef = React.useRef<WaveSurfer>();

  const { workspace } = React.useContext(context);

  React.useEffect(() => {
    if (container) {
      const waveSurfer = WaveSurfer.create({
        container,
        height: 120,
        backgroundColor: '#111',
        waveColor: 'violet',
        progressColor: 'purple',
        hideScrollbar: true
      });

      waveSurfer.load(workspace?.origin.audio?.url ?? '');
      waveSurfer.setMute(true);

      let selfInvoke = false;

      waveSurfer.on('interaction', () => {
        selfInvoke = true;
        setTime(waveSurfer.getCurrentTime());
      });

      playerRef.current = waveSurfer;
      
      const item: Playable = {
        name: 'wave-view',
        play() {
          waveSurfer.play();
        },
        pause() {
          waveSurfer.pause();
        },
        setTime(time: number) {
          if (selfInvoke) {
            selfInvoke = false;
            return;
          }
          waveSurfer.setCurrentTime(time);
        }
      };

      subscribe(item);

      return () => {
        unsubscribe(item);
      };
    }

    return;
  }, [container, setTime]);

  return (
    <WaveViewElement
      ref={e => container || (e && setContainer(e))}
      onClick={e => {
        // playerRef.current?.pause();
        e.stopPropagation();
      }}
    />
  );
};


export default WaveView;
 
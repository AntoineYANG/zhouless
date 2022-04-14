/*
 * @Author: Kanata You 
 * @Date: 2022-04-13 23:23:53 
 * @Last Modified by: Kanata You
 * @Last Modified time: 2022-04-15 02:27:39
 */

import React from 'react';
import styled from 'styled-components';
// import WaveSurfer from 'wavesurfer.js';

import type { EditorContext } from '@views';
import type { Playable } from '@components/media-group';
import parseWav, { drawFrames } from '@utils/parse_wav';


const WaveViewElement = styled.div({
  width: '100%',
  height: '128px',
  color: '#aaa',
  border: '1px solid',
});

const WaveContainer = styled.div({
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'row',
  overflow: 'scroll hidden',
});

const Wave = styled.div<{ dataUrl: string; w: number }>(({ dataUrl, w }) => ({
  flexGrow: 0,
  flexShrink: 0,
  backgroundImage: `url(${dataUrl})`,
  width: w,
  height: '100%',
  backgroundSize: '100% 128px',
}));

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
  // const [container, setContainer] = React.useState<HTMLDivElement>();
  // const [canvas, setCanvas] = React.useState<HTMLCanvasElement>();

  const { workspace } = React.useContext(context);
  const [wave, setWave] = React.useState<{
    dataUrl: string;
    width: number;
  } | null>(null);

  React.useEffect(() => {
    setWave(null);
  }, [workspace?.origin.audio]);

  React.useEffect(() => {
    if (workspace?.origin.audio && typeof workspace.origin.duration === 'number') {
      parseWav(workspace.origin.audio.data).then(async d => {
        if (d) {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

          canvas.height = 256;
          canvas.style.position = 'fixed';
          canvas.style.left = '0';
          canvas.style.top = '4vw';
          canvas.style.border = '1px solid #999';
          canvas.style.backgroundColor = '#0004';
          canvas.width = d.duration * 20;

          document.body.appendChild(canvas);

          await drawFrames(ctx, d.frames, canvas.width);

          setWave({
            dataUrl: canvas.toDataURL(),
            width: canvas.width
          });

          canvas.remove();
        }
      });

      return;
    }

    return;
  }, [setTime, workspace?.origin.duration, workspace?.origin.audio?.data, setWave]);

  return (
    <WaveViewElement
      // ref={e => container || (e && setContainer(e))}
      onClick={e => {
        e.stopPropagation();
      }}
    >
      {/* TODO: i18n */}
      <WaveContainer>
        {
          wave ? (
            <Wave
              dataUrl={wave.dataUrl}
              w={wave.width}
            />
          ) : 'loading...'
        }
      </WaveContainer>
    </WaveViewElement>
  );
};


export default WaveView;
 
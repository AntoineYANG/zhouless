/*
 * @Author: Kanata You 
 * @Date: 2022-04-13 23:23:53 
 * @Last Modified by: Kanata You
 * @Last Modified time: 2022-04-15 23:58:54
 */

import React from 'react';
import styled from 'styled-components';

import type EditorContext from '@views/context';
import type { Playable } from '@components/media-group';
import parseWav, { drawWavData } from '@utils/parse_wav';


const WaveViewElement = styled.div({
  width: '100%',
  height: '128px',
  color: '#aaa',
  border: '1px solid',
});

const WaveContainer = styled.div({
  position: 'relative',
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

const WaveProgress = styled.div<{ curT: number; duration: number; w: number }>(({ curT, duration, w }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  width: `${(curT / duration * w).toFixed(3)}px`,
  height: '100%',
  borderRight: '1px solid #fffa',
  backdropFilter: 'brightness(0.6)',
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
  const [curTime, setCurTime] = React.useState<number>(0);

  React.useEffect(() => {
    let video = document.querySelector('video');

    let paused = true;

    const updateProgress = () => {
      if (paused) {
        return;
      }
      
      video = video ?? document.querySelector('video');

      if (!video) {
        return;
      }

      setCurTime(video.currentTime);

      requestAnimationFrame(updateProgress);
    };

    const item: Playable = {
      name: 'wave-view',
      play() {
        if (paused) {
          requestAnimationFrame(updateProgress);
          paused = false;
        }
      },
      pause() {
        if (!paused) {
          paused = true;
        }
      },
      setTime(time) {
        setCurTime(time);
      }
    };

    subscribe(item);

    return () => unsubscribe(item);
  }, [subscribe, unsubscribe, setCurTime]);

  const { workspace } = React.useContext(context);
  const [wave, setWave] = React.useState<{
    dataUrl: string;
    width: number;
  } | null>(null);

  const [failed, setFailed] = React.useState(false);

  React.useEffect(() => {
    setWave(null);
    setFailed(false);
  }, [workspace?.origin.audio]);

  React.useEffect(() => {
    if (!wave && workspace?.origin.audio && typeof workspace.origin.duration === 'number') {
      parseWav(workspace.origin.audio.data).then(async d => {
        if (d) {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

          canvas.height = 400;
          canvas.style.position = 'fixed';
          canvas.style.left = '0';
          canvas.style.top = '104vh';
          canvas.width = d.duration * 20;

          document.body.appendChild(canvas);

          await drawWavData(ctx, d.channels, canvas.width);

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
  }, [setTime, workspace?.origin.duration, workspace?.origin.audio?.data, wave, setWave]);

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
          failed ? 'failed' : (
            wave ? (
              <>
                <Wave
                  dataUrl={wave.dataUrl}
                  w={wave.width}
                />
                <WaveProgress
                  curT={curTime}
                  duration={workspace?.origin.duration ?? 1}
                  w={wave.width}
                />
              </>
            ) : 'loading...'
          )
        }
      </WaveContainer>
    </WaveViewElement>
  );
};


export default WaveView;
 
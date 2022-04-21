/*
 * @Author: Kanata You 
 * @Date: 2022-04-13 23:23:53 
 * @Last Modified by: Kanata You
 * @Last Modified time: 2022-04-21 18:27:59
 */

import React from 'react';
import styled from 'styled-components';

import type EditorContext from '@views/context';
import type { Playable } from '@components/media-group';
import { useTranslation } from 'react-i18next';


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

const Wave = styled.div<{ dataUrl: string }>(({ dataUrl }) => ({
  flexGrow: 0,
  flexShrink: 0,
  backgroundImage: `url(${dataUrl})`,
  height: '100%',
  backgroundSize: '100% 128px',
}));

const WaveProgress = styled.div({
  position: 'absolute',
  top: 0,
  left: 0,
  height: '100%',
  borderRight: '1px solid #fffa',
  backdropFilter: 'brightness(0.6)',
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
  setTime,
}) => {
  const [curTime, setCurTime] = React.useState<number>(0);
  const { t } = useTranslation();

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
  const wave = workspace?.origin.audio?.wave;

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
          wave === 'failed' ? 'failed' : (
            wave ? (
              <>
                <Wave
                  dataUrl={wave.dataUrl}
                  style={{
                    width: wave.width
                  }}
                />
                <WaveProgress
                  style={{
                    width: `${
                      (curTime / (workspace?.origin.duration ?? 1) * wave.width).toFixed(3)
                    }px`
                  }}
                />
              </>
            ) : t('audio_parse_loading')
          )
        }
      </WaveContainer>
    </WaveViewElement>
  );
};


export default WaveView;
 
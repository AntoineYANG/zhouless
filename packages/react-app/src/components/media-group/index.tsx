/*
 * @Author: Kanata You 
 * @Date: 2022-04-13 16:38:33 
 * @Last Modified by: Kanata You
 * @Last Modified time: 2022-04-21 18:11:44
 */

import React from 'react';
import styled from 'styled-components';

import ResizeBar from '@components/resize-bar';
import VideoView from '@components/video-view';
import AudioView from '@components/audio-view';
import type EditorContext from '@views/context';
import type { EditorContextDispatcher } from '@views/context';
import useLocalStorage from '@utils/use_local_storage';


const MIN_HEIGHT = 0.3;
const MAX_HEIGHT = 1;

const MediaGroupElement = styled.section({
  position: 'relative',
  flexGrow: 0,
  flexShrink: 0,
  minHeight: `${(100 * MIN_HEIGHT).toFixed(0)}vh`,
  maxHeight: `${(100 * MAX_HEIGHT).toFixed(0)}vh`,
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'stretch',
  justifyContent: 'stretch',
  overflow: 'hidden',
  '@media (prefers-color-scheme: dark)': {
    backgroundColor: '#222',
  },
  '@media (prefers-color-scheme: light)': {
    backgroundColor: '#eee',
  },
  transition: 'height 10ms, background-color 200ms',
});

export interface MediaGroupProps {
  container: HTMLElement | undefined;
  context: React.Context<EditorContext>;
  dispatch: EditorContextDispatcher;
}

export interface Playable {
  name: string;
  play: () => void;
  pause: () => void;
  setTime: (time: number) => void;
}

/**
 * 界面上半部分，视频和音频的容器.
 */
const MediaGroup: React.FC<MediaGroupProps> = React.memo(function MediaGroup ({
  context,
  dispatch,
  container
}) {
  const [groupElement, setGroupElement] = React.useState<HTMLElement>();
  const [height, setHeight] = useLocalStorage(
    'media_group_height',
    window.innerHeight * 0.52
  );

  const onResize = React.useCallback((h: number) => {
    setHeight(h);
  }, [setHeight]);

  const openVideo = React.useCallback((video: File) => {
    dispatch({
      type: 'OPEN_VIDEO',
      payload: {
        video
      }
    });
  }, [dispatch]);

  const setVideoDuration = React.useCallback((duration: number) => {
    dispatch({
      type: 'SET_ORIGIN_DURATION',
      payload: {
        duration
      }
    });
  }, [dispatch]);

  const setAudioWave = React.useCallback((wave: {
    dataUrl: string;
    width: number;
  }) => {
    dispatch({
      type: 'SET_AUDIO_WAVE',
      payload: {
        wave
      }
    });
  }, [dispatch]);

  const playableListRef = React.useRef<Playable[]>([]);

  const subscribe = React.useCallback((item: Playable) => {
    playableListRef.current.push(item);
  }, [playableListRef]);

  const unsubscribe = React.useCallback((item: Playable) => {
    playableListRef.current = playableListRef.current.filter(e => e !== item);
  }, [playableListRef]);

  let isPlayingRef = React.useRef(false);

  const playOrPause = React.useCallback(() => {
    if (isPlayingRef.current === true) {
      playableListRef.current.forEach(item => item.pause());
    } else {
      playableListRef.current.forEach(item => item.play());
    }

    isPlayingRef.current = !isPlayingRef.current;
  }, [isPlayingRef]);
  
  const setTime = React.useCallback((time: number) => {
    playableListRef.current.forEach(item => item.setTime(time));
  }, []);

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === ' ') {
        playOrPause();
      }
    };

    document.body.addEventListener('keypress', handler);

    return () => {
      document.body.removeEventListener('keypress', handler);
    };
  }, [playOrPause]);

  return (
    <MediaGroupElement
      ref={e => e && setGroupElement(e)}
      style={{
        height: `${height}px`
      }}
      onClick={playOrPause}
    >
      <VideoView
        parent={groupElement}
        context={context}
        openVideo={openVideo}
        setVideoDuration={setVideoDuration}
        setAudioWave={setAudioWave}
        subscribe={subscribe}
        unsubscribe={unsubscribe}
      />
      <AudioView
        context={context}
        subscribe={subscribe}
        unsubscribe={unsubscribe}
        setTime={setTime}
      />
      <ResizeBar
        container={groupElement?.parentElement ?? container}
        target={groupElement}
        min={MIN_HEIGHT}
        max={MAX_HEIGHT}
        onResize={onResize}
      />
    </MediaGroupElement>
  );
});


export default MediaGroup;

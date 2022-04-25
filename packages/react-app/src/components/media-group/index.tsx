/*
 * @Author: Kanata You 
 * @Date: 2022-04-13 16:38:33 
 * @Last Modified by: Kanata You
 * @Last Modified time: 2022-04-25 14:43:09
 */

import React from 'react';
import styled from 'styled-components';

import ResizeBar from '@components/resize-bar';
import VideoView from '@components/video-view';
import AudioView from '@components/audio-view';
import type EditorContext from '@views/context';
import type { EditorContextDispatcher } from '@views/context';
import useLocalStorage from '@utils/use_local_storage';
import PlayControl from '@components/play-control';
import EditHelper from '@views/edit-helper';


const MIN_HEIGHT = 0.3;
const MAX_HEIGHT = 1;

const MediaGroupElement = styled.div({
  position: 'relative',
  flexGrow: 0,
  flexShrink: 0,
  minHeight: `${(100 * MIN_HEIGHT).toFixed(0)}vh`,
  maxHeight: `${(100 * MAX_HEIGHT).toFixed(0)}vh`,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
  justifyContent: 'stretch',
  overflow: 'hidden',
  '@media (prefers-color-scheme: dark)': {
    backgroundColor: '#2e2e2e',
  },
  '@media (prefers-color-scheme: light)': {
    backgroundColor: '#ccc',
  },
  transition: 'height 10ms, background-color 200ms',
});

const MediaGroupContainer = styled.section({
  flexGrow: 1,
  flexShrink: 0,
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'stretch',
  justifyContent: 'stretch',
  overflow: 'hidden',
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
  const contextState = React.useContext(context);
  const { workspace } = contextState;

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
        duration,
        helper: new EditHelper(
          contextState,
        )
      }
    });
  }, [dispatch, contextState]);

  const helper = contextState.workspace?.helper;

  if (helper) {
    helper.context = contextState;
  }

  const playableListRef = React.useRef<Playable[]>([]);

  const subscribe = React.useCallback((item: Playable) => {
    playableListRef.current.push(item);
  }, [playableListRef]);

  const unsubscribe = React.useCallback((item: Playable) => {
    playableListRef.current = playableListRef.current.filter(e => e !== item);
  }, [playableListRef]);

  let isPlayingRef = React.useRef(false);

  const play = React.useCallback(() => {
    if (isPlayingRef.current === false) {
      playableListRef.current.forEach(item => item.play());
    }

    isPlayingRef.current = true;
  }, [isPlayingRef]);

  const pause = React.useCallback(() => {
    if (isPlayingRef.current === true) {
      playableListRef.current.forEach(item => item.pause());
    }

    isPlayingRef.current = false;
  }, [isPlayingRef]);
  
  const setTime = React.useCallback((time: number) => {
    playableListRef.current.forEach(item => item.setTime(time));
  }, []);

  return (
    <MediaGroupElement
      ref={e => e && setGroupElement(e)}
      style={{
        height: `${height}px`
      }}
    >
      <MediaGroupContainer>
        <VideoView
          parent={groupElement}
          context={context}
          openVideo={openVideo}
          setVideoDuration={setVideoDuration}
          subscribe={subscribe}
          unsubscribe={unsubscribe}
        />
        <AudioView
          context={context}
          subscribe={subscribe}
          unsubscribe={unsubscribe}
          setTime={setTime}
        />
      </MediaGroupContainer>
      <PlayControl
        context={context}
        subscribe={subscribe}
        unsubscribe={unsubscribe}
        duration={workspace?.origin.duration ?? NaN}
        isPlaying={() => isPlayingRef.current}
        play={play}
        pause={pause}
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

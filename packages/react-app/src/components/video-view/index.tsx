/*
 * @Author: Kanata You 
 * @Date: 2022-04-13 18:36:40 
 * @Last Modified by: Kanata You
 * @Last Modified time: 2022-04-24 16:49:55
 */

import React from 'react';
import styled from 'styled-components';

import type EditorContext from '@views/context';
import ResizeBar from '@components/resize-bar';
import OpenVideoButton from './open-video-button';
import VideoPlayer from './video-player';
import type { Playable } from '@components/media-group';
import useLocalStorage from '@utils/use_local_storage';


const MIN_WIDTH = 0.3;
const MAX_WIDTH = 0.75;
const PADDING = 12;

const VideoViewElement = styled.article({
  position: 'relative',
  flexGrow: 0,
  flexShrink: 0,
  '@media (prefers-color-scheme: dark)': {
    backgroundColor: '#333',
  },
  '@media (prefers-color-scheme: light)': {
    backgroundColor: '#ddd',
  },
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: `${PADDING}px`,
  overflow: 'hidden',
  transition: 'width 10ms',
});

export interface VideoViewProps {
  parent: HTMLElement | undefined;
  context: React.Context<EditorContext>;
  openVideo: (video: File) => void;
  setVideoDuration: (duration: number) => void;
  subscribe: (item: Playable) => void;
  unsubscribe: (item: Playable) => void;
}

/**
 * 视频媒体元素和相关控件的容器.
 */
const VideoView: React.FC<VideoViewProps> = ({
  parent,
  context,
  openVideo,
  setVideoDuration,
  subscribe,
  unsubscribe,
}) => {
  const contextState = React.useContext(context);
  const [container, setContainer] = React.useState<HTMLElement>();
  const [width, setWidth] = useLocalStorage(
    'video_view_width',
    window.innerWidth * 0.5
  );

  const onResize = React.useCallback((w: number) => {
    setWidth(w);
  }, [setWidth]);

  const handleVideoReady = React.useCallback((e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    const ele = e.currentTarget as HTMLVideoElement;

    setVideoDuration(ele.duration);
  }, [setVideoDuration]);

  return (
    <VideoViewElement
      ref={e => container || (e && setContainer(e))}
      style={{
        width: `${width - /* 左右 padding */ PADDING * 2}px`
      }}
    >
      {
        contextState.workspace ? (
          <VideoPlayer
            context={context}
            url={contextState.workspace.origin.url}
            container={container}
            subscribe={subscribe}
            unsubscribe={unsubscribe}
            onReady={handleVideoReady}
          />
        ) : (
          <OpenVideoButton
            openVideo={openVideo}
          />
        )
      }
      <ResizeBar
        direction="ew"
        container={parent}
        target={container}
        min={MIN_WIDTH}
        max={MAX_WIDTH}
        onResize={onResize}
      />
    </VideoViewElement>
  );
};

export default VideoView;

/*
 * @Author: Kanata You 
 * @Date: 2022-04-13 18:36:40 
 * @Last Modified by: Kanata You
 * @Last Modified time: 2022-04-13 23:51:51
 */

import React from 'react';
import styled from 'styled-components';

import type { EditorContext } from '@views';
import OpenVideoButton from './open-video-button';
import VideoPlayer from './video-player';
import type { Playable } from '@components/media-group';


const VideoViewElement = styled.article({
  flexGrow: 1,
  backgroundColor: '#333',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '12px',
  overflow: 'hidden',
});

export interface VideoViewProps {
  context: React.Context<EditorContext>;
  openVideo: (video: File) => void;
  subscribe: (item: Playable) => void;
  unsubscribe: (item: Playable) => void;
}

const VideoView: React.FC<VideoViewProps> = ({
  context,
  openVideo,
  subscribe,
  unsubscribe,
}) => {
  const contextState = React.useContext(context);
  const [container, setContainer] = React.useState<HTMLElement>();

  return (
    <VideoViewElement
      ref={e => container || (e && setContainer(e))}
    >
      {
        container && contextState.workspace ? (
          <VideoPlayer
            url={contextState.workspace.origin.url}
            container={container}
            subscribe={subscribe}
            unsubscribe={unsubscribe}
          />
        ) : (
          <OpenVideoButton
            openVideo={openVideo}
          />
        )
      }
    </VideoViewElement>
  );
};

export default VideoView;

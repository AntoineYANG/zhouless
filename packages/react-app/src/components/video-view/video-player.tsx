/*
 * @Author: Kanata You 
 * @Date: 2022-04-13 21:48:28 
 * @Last Modified by: Kanata You
 * @Last Modified time: 2022-04-13 23:56:16
 */

import React from 'react';
import styled from 'styled-components';

import type { Playable } from '@components/media-group';


const VideoPlayerElement = styled.video({
  maxWidth: '98%',
  maxHeight: '98%',
  outline: 'none',
  transition: 'width 10ms, height 10ms',
});

export interface VideoPlayerProps {
  container: HTMLElement;
  url: string;
  subscribe: (item: Playable) => void;
  unsubscribe: (item: Playable) => void;
}

/**
 * 视频元素容器.
 */
const VideoPlayer: React.FC<VideoPlayerProps> = React.memo(function VideoPlayer ({
  container,
  url,
  subscribe,
  unsubscribe
}) {
  const [{ videoWidth, videoHeight }, setVideoSize] = React.useState({
    videoWidth: 0,
    videoHeight: 0
  });

  const handleCanPlay = React.useCallback((e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    setVideoSize({
      videoWidth: e.currentTarget.videoWidth,
      videoHeight: e.currentTarget.videoHeight
    });
  }, [setVideoSize]);

  const [{ maxWidth, maxHeight }, setMaxSize] = React.useState({
    maxWidth: container.clientWidth,
    maxHeight: container.clientHeight
  });

  React.useEffect(() => {
    if (!container.parentElement) {
      return;
    }
    
    const observer = new MutationObserver(() => {
      const maxW = container.clientWidth;
      const maxH = container.clientHeight;
      setMaxSize({
        maxWidth: maxW,
        maxHeight: maxH
      });
    });

    observer.observe(container, {
      attributes: true,
      attributeFilter: ['style']
    });

    observer.observe(container.parentElement, {
      attributes: true,
      attributeFilter: ['style']
    });

    return () => {
      observer.disconnect();
    };
  }, [container.parentElement]);

  const { w, h } = React.useMemo(() => {
    if (videoWidth && videoHeight && maxWidth && maxHeight) {
      if (maxWidth / maxHeight >= videoWidth / videoHeight) {
        // 优先高度填充
        const h = maxHeight - 24;

        return {
          w: h / videoHeight * videoWidth,
          h
        };
      } else {
        // 优先宽度填充
        const w = maxWidth - 24;

        return {
          w,
          h: w * videoHeight / videoWidth
        };
      }
    }

    return {
      w: 0,
      h: 0
    };
  }, [videoWidth, videoHeight, maxWidth, maxHeight]);

  const [player, setPlayer] = React.useState<HTMLVideoElement>();

  React.useEffect(() => {
    if (!player) {
      return;
    }

    const item: Playable = {
      name: 'video-player',
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
    <VideoPlayerElement
      src={url}
      controls={false}
      preload="auto"
      onCanPlay={handleCanPlay}
      muted
      ref={e => e && setPlayer(e)}
      style={
        w && h ? {
          width: `${w}px`,
          height: `${h}px`
        } : {
          width: '1px',
          height: '1px',
          opacity: 0
        }
      }
    />
  );
});


export default VideoPlayer;

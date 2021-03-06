/*
 * @Author: Kanata You 
 * @Date: 2022-04-13 21:48:28 
 * @Last Modified by: Kanata You
 * @Last Modified time: 2022-04-24 16:50:06
 */

import React from 'react';
import styled from 'styled-components';

import type EditorContext from '@views/context';
import type { Playable } from '@components/media-group';
import parseWav, { drawWavData } from '@utils/parse_wav';


const VideoPlayerElement = styled.video({
  maxWidth: '98%',
  maxHeight: '98%',
  outline: 'none',
});

export interface VideoPlayerProps {
  context: React.Context<EditorContext>;
  container: HTMLElement | undefined;
  url: string;
  subscribe: (item: Playable) => void;
  unsubscribe: (item: Playable) => void;
  onReady: (e: React.SyntheticEvent<HTMLVideoElement, Event>) => void;
}

/**
 * 视频元素容器.
 */
const VideoPlayer: React.FC<VideoPlayerProps> = React.memo(function VideoPlayer ({
  context,
  container,
  url,
  subscribe,
  unsubscribe,
  onReady,
}) {
  const { workspace: { origin } = { origin: null } } = React.useContext(context);

  const [{ videoWidth, videoHeight }, setVideoSize] = React.useState({
    videoWidth: 0,
    videoHeight: 0
  });

  const handleCanPlay = React.useCallback((e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    if (videoWidth && videoHeight) {
      return;
    }

    setVideoSize({
      videoWidth: e.currentTarget.videoWidth,
      videoHeight: e.currentTarget.videoHeight
    });
    onReady(e);
  }, [videoWidth, videoHeight, setVideoSize, onReady]);

  const [{ maxWidth, maxHeight }, setMaxSize] = React.useState({
    maxWidth: container?.clientWidth ?? 0,
    maxHeight: container?.clientHeight ?? 0
  });

  React.useEffect(() => {
    if (!container?.parentElement) {
      return;
    }
    
    const maxW = container.clientWidth;
    const maxH = container.clientHeight;
    setMaxSize({
      maxWidth: maxW,
      maxHeight: maxH
    });
    
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
  }, [container?.parentElement, setMaxSize]);

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
    };
  }, [player]);

  const shouldDisplay = React.useMemo(() => {
    return w && h;
  }, [w, h]);

  return (
    <VideoPlayerElement
      src={url}
      controls={false}
      preload="auto"
      onCanPlay={handleCanPlay}
      // muted
      ref={e => e && setPlayer(e)}
      style={
        shouldDisplay ? {
          width: `${w}px`,
          height: `${h}px`
        } : {
          width: '0',
          height: '0'
        }
      }
    />
  );
});


export default VideoPlayer;

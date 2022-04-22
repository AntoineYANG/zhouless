/*
 * @Author: Kanata You 
 * @Date: 2022-04-22 16:56:25 
 * @Last Modified by: Kanata You
 * @Last Modified time: 2022-04-22 23:12:18
 */

import React from 'react';
import styled from 'styled-components';

import type { Playable } from '@components/media-group';
import PlayControlButton from './button';
import formatTime from '@utils/format_time';
import type EditorContext from '@views/context';


const ProgressContainer = styled.div({
  flexGrow: 0,
  flexShrink: 0,
  height: '24px',
  marginBlockStart: '6px',
  marginBlockEnd: '3px',
  marginInlineStart: '1.2em',
  marginInlineEnd: '1.2em',
  display: 'flex',
  flexDirection: 'column',
});

const ProgressBase = styled.div({
  position: 'relative',
  flexGrow: 1,
  flexShrink: 1,
  height: '4px',
  marginBlockEnd: '6px',
  '@media (prefers-color-scheme: dark)': {
    backgroundColor: '#1e1e1e',
    boxShadow: '1px 0.5px 3px 2px #0002, inset 1px 0.5px 3px 2px #0008',
  },
  '@media (prefers-color-scheme: light)': {
    backgroundColor: '#e4e4e4',
    boxShadow: '1px 0.5px 3px 2px #0002',
  },
  '&:hover': {
    marginBlockEnd: '0',
  },
  transition: 'background-color 200ms, margin 200ms',
});

const ProgressBar = styled.div({
  height: '100%',
  pointerEvents: 'none',
  '@media (prefers-color-scheme: dark)': {
    backgroundColor: '#e4e4e4',
  },
  '@media (prefers-color-scheme: light)': {
    backgroundColor: '#1e1e1e',
  },
});

const ProgressLabelGroup = styled.div({
  flexGrow: 0,
  flexShrink: 0,
  fontSize: '10px',
  height: '12px',
  lineHeight: '12px',
  marginBlockStart: '2px',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'baseline',
  justifyContent: 'space-between',

  '& > label': {
    userSelect: 'none',

    '& > span': {
      marginInlineEnd: '1em',
    },
  },

  '@media (prefers-color-scheme: dark)': {
    color: '#bde',
  },
  '@media (prefers-color-scheme: light)': {
    color: '#222',
  },
});

const cursorColorDark = '#72c';
const cursorColorLight = '#8cf';

const ProgressLabelHover = styled.div<{ at: 'left' | 'right' }>(({ at }) => ({
  position: 'absolute',
  bottom: '60%',
  fontSize: '108%',
  fontWeight: 600,
  lineHeight: '1.2em',
  display: 'flex',
  flexDirection: at === 'right' ? 'row' : 'row-reverse',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  pointerEvents: 'none',
  
  '& > label': {
    flexGrow: 0,
    flexShrink: 0,
    height: '1.2em',
    borderBlockEndWidth: '2px',
    borderBlockEndStyle: 'solid',
    userSelect: 'none',
    backdropFilter: 'blur(2px)',
    
    '@media (prefers-color-scheme: dark)': {
      color: cursorColorDark,
      textShadow: '0 0 2px #000, 0 0 1px #000, 0 0 0 #000',
    },
    '@media (prefers-color-scheme: light)': {
      color: cursorColorLight,
      textShadow: '0 0 2px #fff, 0 0 1px #fff, 0 0 0 #fff',
    },

    '& > span': {
      marginInlineEnd: '1em',
    },
  },
}));

const ProgressLabelCursor = styled.div<{ at: 'left' | 'right' }>(({ at }) => ({
  flexGrow: 0,
  flexShrink: 0,
  width: '2em',
  height: '3.464em',
  marginBlockStart: '1.28em',
  backgroundSize: 'cover',
  backgroundRepeat: 'no-repeat',
  
  '@media (prefers-color-scheme: dark)': {
    backgroundImage: `linear-gradient(${
      at === 'left' ? 60 : -60
    }deg, ${cursorColorDark}0 48%, ${cursorColorDark} 49%, ${
      cursorColorDark} 51%, ${cursorColorDark
    }0 52%)`,
  },
  '@media (prefers-color-scheme: light)': {
    backgroundImage: `linear-gradient(${
      at === 'left' ? 60 : -60
    }deg, ${cursorColorLight}0 48%, ${cursorColorLight} 49%, ${
      cursorColorLight} 51%, ${cursorColorLight
    }0 52%)`,
  },
}));

const PlayControlElement = styled.div({
  flexGrow: 0,
  flexShrink: 0,
  height: '32px',
  borderRadius: '16px',
  marginBlockStart: '3px',
  marginBlockEnd: '12px',
  marginInlineStart: '1.2em',
  marginInlineEnd: '1.2em',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  '@media (prefers-color-scheme: dark)': {
    backgroundColor: '#1e1e1e',
    boxShadow: '1px 1px 5px -1px #0008',
  },
  '@media (prefers-color-scheme: light)': {
    backgroundColor: '#e4e4e4',
    boxShadow: '1px 1px 5px -1px #0008',
  },
});

export interface PlayControlProps {
  context: React.Context<EditorContext>;
  subscribe: (item: Playable) => void;
  unsubscribe: (item: Playable) => void;
  duration: number;
  isPlaying: () => boolean;
  play: () => void;
  pause: () => void;
  setTime: (time: number) => void;
}

/**
 * 播放控件.
 */
const PlayControl: React.FC<PlayControlProps> = React.memo(function PlayControl ({
  context,
  duration,
  subscribe,
  unsubscribe,
  isPlaying,
  play,
  pause,
  setTime,
}) {
  const loaded = !Number.isNaN(duration);
  const [curTime, setCurTime] = React.useState<number>(0);
  const [hover, setHover] = React.useState<number | null>(null);
  const [nowPlaying, setNowPlaying] = React.useState(false);

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
          setNowPlaying(true);
        }
      },
      pause() {
        if (!paused) {
          paused = true;
          setNowPlaying(false);
        }
      },
      setTime(time) {
        setCurTime(time);
      }
    };

    subscribe(item);

    return () => unsubscribe(item);
  }, [subscribe, unsubscribe, setCurTime, setNowPlaying]);

  const handleProgressHover = React.useCallback((e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (Number.isNaN(duration)) {
      return;
    }

    const base = e.currentTarget as HTMLDivElement;

    const width = base.clientWidth;
    const x = e.clientX - base.offsetLeft;
    const pos = Math.min(
      duration,
      duration * x / width
    );

    setHover(pos);
  }, [hover, setHover, duration]);

  const handleProgressMoveOut = React.useCallback(() => {
    if (hover !== null) {
      setHover(null);
    }
  }, [hover, setHover]);

  const handleProgressClick = React.useCallback(() => {
    if (hover !== null) {
      setTime(hover);
    }
  }, [hover, setTime]);

  const playOrPause = React.useCallback(() => {
    if (isPlaying()) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, play, pause]);

  const { workspace } = React.useContext(context);

  const pressedTimeRef = React.useRef(curTime);

  if (workspace?.helper?.getPreview?.()) {
    workspace.helper.willAppendItem(pressedTimeRef.current, curTime);
  }

  const willAppendSubtitle = React.useCallback(() => {
    pressedTimeRef.current = Math.max(curTime - (
      nowPlaying ? /** 假想的反应延迟 */ 0.1 : 0
    ), 0);
    workspace?.helper?.willAppendItem?.(pressedTimeRef.current, curTime);
  }, [workspace?.helper, curTime, nowPlaying]);
  
  const appendSubtitle = React.useCallback(() => {
    workspace?.helper?.clearWillAppendItem();
    workspace?.helper?.appendItem?.(pressedTimeRef.current, curTime);

    return new Promise<void>(resolve => setTimeout(resolve, 100));
  }, [workspace?.helper, pressedTimeRef.current, curTime]);

  return (
    <React.Fragment>
      <ProgressContainer role="progressbar">
        <ProgressBase
          onMouseOver={handleProgressHover}
          onMouseMove={handleProgressHover}
          onMouseOut={handleProgressMoveOut}
          onClick={handleProgressClick}
        >
          {
            loaded && (
              <ProgressBar
                style={{
                  width: `${(curTime / duration * 100).toFixed(3)}%`
                }}
              />
            )
          }
          {
            hover !== null && (
              <ProgressLabelHover
                at={hover > duration * 0.55 ? 'left' : 'right'}
                style={
                  hover > duration * 0.55 ? {
                    right: (100 - hover / duration * 100).toFixed(3) + '%'
                  } : {
                    left: (hover / duration * 100).toFixed(3) + '%'
                  }
                }
              >
                <ProgressLabelCursor
                  at={hover > duration * 0.55 ? 'left' : 'right'}
                />
                <label>
                  <span>
                    {formatTime(hover)}
                  </span>
                  <span>
                    {(hover / duration * 100).toFixed(3) + '%'}
                  </span>
                </label>
              </ProgressLabelHover>
            )
          }
        </ProgressBase>
        <ProgressLabelGroup>
          <label>
            <span>
              {formatTime(curTime)}
            </span>
            {
              loaded && (
                <span>
                  {(curTime / duration * 100).toFixed(3) + '%'}
                </span>
              )
            }
          </label>
          <label>
            {formatTime(duration)}
          </label>
        </ProgressLabelGroup>
      </ProgressContainer>
      <PlayControlElement>
        <PlayControlButton
          name={`control_bar.${nowPlaying ? 'pause' : 'play'}`}
          disabled={!loaded}
          big
          action={playOrPause}
          hotkey=" "
          svg={
            nowPlaying
              ? 'M5,5 V15 H7 V5 Z M13,5 V15 H15 V5 Z'
              : 'M5.5,5 L5.5,15 S6.5,16 7.5,16 L16.5,10.5 S17.5,10 16.5,9.5 L7.5,4 S6.5,4 5.5,5'
          }
        />
        <PlayControlButton
          name="control_bar.append_subtitle"
          disabled={!loaded || !workspace?.helper}
          onPressed={willAppendSubtitle}
          action={appendSubtitle}
          hotkey="Enter"
          svg="M5,10 H15 M10,5 V15"
        />
      </PlayControlElement>
    </React.Fragment>
  );
});


export default PlayControl;

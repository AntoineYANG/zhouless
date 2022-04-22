/*
 * @Author: Kanata You 
 * @Date: 2022-04-13 19:00:22 
 * @Last Modified by: Kanata You
 * @Last Modified time: 2022-04-22 17:17:49
 */

import React from 'react';
import styled from 'styled-components';

import type EditorContext from '@views/context';
import type { Playable } from '@components/media-group';
// import AudioPlayer from './audio-player';
import WaveView from './wave-view';


const AudioViewElement = styled.article({
  flexGrow: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
  justifyContent: 'center',
  padding: '12px',
  overflow: 'hidden',
  '@media (prefers-color-scheme: dark)': {
    backgroundColor: '#282828',
  },
  '@media (prefers-color-scheme: light)': {
    backgroundColor: '#d6d6d6',
  },
});

const AudioViewContainer = styled.article({
  flexGrow: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
  justifyContent: 'center',
  overflow: 'hidden',
});

export interface AudioViewProps {
  context: React.Context<EditorContext>;
  subscribe: (item: Playable) => void;
  unsubscribe: (item: Playable) => void;
  setTime: (time: number) => void;
}

const AudioView: React.FC<AudioViewProps> = ({
  context,
  subscribe,
  unsubscribe,
  setTime,
}) => {
  const { workspace } = React.useContext(context);

  return (
    <AudioViewElement>
      {
        workspace?.origin.audio ? (
          <>
            <WaveView
              context={context}
              subscribe={subscribe}
              unsubscribe={unsubscribe}
              setTime={setTime}
            />
            {/* <AudioPlayer
              url={workspace.origin.audio.url}
              subscribe={subscribe}
              unsubscribe={unsubscribe}
            /> */}
          </>
        ) : null
      }
    </AudioViewElement>
  );
};

export default AudioView;

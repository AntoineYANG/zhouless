/** ESPOIR TEMPLATE */
      
import React from 'react';
import styled from 'styled-components';

import MediaGroup from '@components/media-group';
import '@locales/i18n';
import separateAudioFromVideo from '@utils/separate_audio_from_video';


export interface EditorContext {
  workspace: {
    dir: string;
    filename: string;
    origin: {
      url: string;
      data: File;
      size: number;
      duration?: number;
      audio?: {
        url: string;
        data: ArrayBuffer;
      } | undefined;
    };
  } | undefined;
}

export type OpenVideoAction = {
  type: 'OPEN_VIDEO';
  payload: {
    video: File;
  };
};

export type SetOriginDurationAction = {
  type: 'SET_ORIGIN_DURATION';
  payload: {
    duration: number;
  };
};

export type SetOriginAudioAction = {
  type: 'SET_ORIGIN_AUDIO';
  payload: {
    audio: ArrayBuffer;
  };
};

export type EditorContextAction = (
  | OpenVideoAction
  | SetOriginDurationAction
  | SetOriginAudioAction
);

export type EditorContextDispatcher = (action: EditorContextAction) => void;

const Main = styled.main({
  width: '100vw',
  height: '100vh',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
  justifyContent: 'stretch',
});

const App: React.FC = React.memo(function App () {
  const [container, setContainer] = React.useState<HTMLElement>();

  const [contextState, contextDispatch] = React.useReducer(
    ((state: Readonly<EditorContext>, action: EditorContextAction): EditorContext => {
      switch (action.type) {
        case 'OPEN_VIDEO': {
          if (!state.workspace) {
            const url = URL.createObjectURL(action.payload.video);

            return {
              ...state,
              workspace: {
                dir: '(unknown)',
                filename: action.payload.video.name,
                origin: {
                  url,
                  audio: undefined,
                  size: action.payload.video.size,
                  data: action.payload.video
                }
              }
            };
          }

          return state;
        }

        case 'SET_ORIGIN_DURATION': {
          if (state.workspace && state.workspace.origin.duration === undefined) {
            return {
              ...state,
              workspace: {
                ...state.workspace,
                origin: {
                  ...state.workspace.origin,
                  duration: action.payload.duration
                }
              }
            };
          }

          return state;
        }

        case 'SET_ORIGIN_AUDIO': {
          if (state.workspace) {
            const url = URL.createObjectURL(
              new File([action.payload.audio], 'origin.wav')
            );

            return {
              ...state,
              workspace: {
                ...state.workspace,
                origin: {
                  ...state.workspace.origin,
                  audio: {
                    url,
                    data: action.payload.audio
                  }
                }
              }
            };
          }

          return state;
        }

        default: {
          return state;
        }
      }
    }) as React.ReducerWithoutAction<EditorContext>,
    {
      workspace: undefined
    } as EditorContext
  );

  const context = React.createContext<EditorContext>({
    workspace: undefined
  });

  let runningSeparatingRef = React.useRef(false);

  React.useEffect(() => {
    if (runningSeparatingRef.current) {
      return;
    }

    if (contextState.workspace && !contextState.workspace.origin.audio) {
      runningSeparatingRef.current = true;
      
      separateAudioFromVideo(contextState.workspace.origin.data).then(audio => {
        if (!audio) {
          throw new Error('Cannot get audio');
        }

        (contextDispatch as (action: EditorContextAction) => void)({
          type: 'SET_ORIGIN_AUDIO',
          payload: {
            audio
          }
        });
      });
    }
  }, [runningSeparatingRef.current, contextState.workspace]);

  return (
    <Main
      ref={e => container || (e && setContainer(e))}
    >
      <context.Provider
        value={contextState}
      >
        {
          container && (
            <MediaGroup
              context={context}
              dispatch={contextDispatch}
              container={container}
            />
          )
        }
      </context.Provider>
    </Main>
  );
});

export default App;

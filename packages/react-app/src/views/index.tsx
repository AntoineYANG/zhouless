/** ESPOIR TEMPLATE */
      
import React from 'react';
import styled from 'styled-components';

import '@locales/i18n';
import separateAudioFromVideo from '@utils/separate_audio_from_video';
import EditorContext, {
  reducer,
  defaultContextState,
  EditorContextAction,
  EditorContextDispatcher
} from './context';
import TitleBar from '@components/title-bar';
import MediaGroup from '@components/media-group';
import Menu from '@components/title-bar/menu';
import EditView from '@components/edit-view';
import ShouldCloseDialog from '@components/should-close-dialog';
import parseWav, { drawWavData } from '@utils/parse_wav';


const Main = styled.main({
  flexGrow: 1,
  flexShrink: 1,
  width: '100vw',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
  justifyContent: 'stretch',
});

const App: React.FC = React.memo(function App () {
  const containerRef = React.useRef<HTMLElement>();

  const [contextState, contextDispatch] = React.useReducer(
    reducer,
    defaultContextState
  );

  const safeCloseProject = React.useCallback(() => {
    return new Promise<boolean>(resolve => {
      (contextDispatch as EditorContextDispatcher)({
        type: 'CLOSE_PROJECT',
        payload: {
          callback: resolve
        }
      });
    });
  }, []);

  const context = React.createContext<EditorContext>(defaultContextState);
  const menu = React.useMemo(
    () => new Menu(() => contextState, contextDispatch),
    [contextState, contextDispatch]
  );

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

  const origin = contextState.workspace?.origin;

  React.useEffect(() => {
    if (!origin?.audio?.wave && origin?.audio && typeof origin.duration === 'number') {
      parseWav(origin.audio.data).then(async d => {
        if (d) {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

          canvas.height = 400;
          canvas.style.position = 'fixed';
          canvas.style.left = '0';
          canvas.style.top = '104vh';
          canvas.width = d.duration * 20;

          document.body.appendChild(canvas);

          await drawWavData(ctx, d.channels, canvas.width);

          (contextDispatch as (action: EditorContextAction) => void)({
            type: 'SET_AUDIO_WAVE',
            payload: {
              wave: {
                dataUrl: canvas.toDataURL(),
                width: canvas.width
              }
            }
          });

          canvas.remove();
        } else {
          (contextDispatch as (action: EditorContextAction) => void)({
            type: 'SET_AUDIO_WAVE',
            payload: {
              wave: 'failed'
            }
          });
        }
      });

      return;
    }

    return;
  }, [origin?.audio, origin?.duration, contextDispatch]);

  return (
    <context.Provider
      value={contextState}
    >
      <TitleBar
        menu={menu}
        safeCloseProject={safeCloseProject}
      />
      <Main
        ref={e => e && (containerRef.current = e)}
      >
        <MediaGroup
          context={context}
          dispatch={contextDispatch}
          container={containerRef.current}
        />
        <EditView
          context={context}
        />
      </Main>
      <ShouldCloseDialog
        context={context}
        dispatch={contextDispatch}
      />
    </context.Provider>
  );
});

export default App;

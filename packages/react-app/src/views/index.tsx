/** ESPOIR TEMPLATE */
      
import React from 'react';
import styled from 'styled-components';

import '@locales/i18n';
import separateAudioFromVideo from '@utils/separate_audio_from_video';
import EditorContext, {
  reducer,
  defaultContextState,
  EditorContextAction
} from './context';
import TitleBar from '@components/title-bar';
import MediaGroup from '@components/media-group';
import Menu from '@components/title-bar/menu';


const Main = styled.main({
  flexGrow: 1,
  flexShrink: 0,
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

  return (
    <context.Provider
      value={contextState}
    >
      <TitleBar
        menu={menu}
      />
      <Main
        ref={e => e && (containerRef.current = e)}
      >
        <MediaGroup
          context={context}
          dispatch={contextDispatch}
          container={containerRef.current}
        />
      </Main>
    </context.Provider>
  );
});

export default App;

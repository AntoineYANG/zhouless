/** ESPOIR TEMPLATE */
      
import React from 'react';
import styled from 'styled-components';

import MediaGroup from '@components/media-group';
import '@locales/i18n';
import separateAudioFromVideo from '@utils/separate_audio_from_video';
import EditorContext, {
  reducer,
  defaultContextState,
  EditorContextAction
} from './context';


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
    reducer,
    defaultContextState
  );

  const context = React.createContext<EditorContext>(defaultContextState);

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
        <MediaGroup
          context={context}
          dispatch={contextDispatch}
          container={container}
        />
      </context.Provider>
    </Main>
  );
});

export default App;

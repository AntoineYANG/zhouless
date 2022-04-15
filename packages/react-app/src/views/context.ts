/*
 * @Author: Kanata You 
 * @Date: 2022-04-15 21:45:15 
 * @Last Modified by: Kanata You
 * @Last Modified time: 2022-04-15 23:36:08
 */

export default interface EditorContext {
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

export const defaultContextState: EditorContext = {
  workspace: undefined,
};

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

export const reducer = ((state: Readonly<EditorContext>, action: EditorContextAction): EditorContext => {
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
}) as React.ReducerWithoutAction<EditorContext>;
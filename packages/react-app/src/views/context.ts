/*
 * @Author: Kanata You 
 * @Date: 2022-04-15 21:45:15 
 * @Last Modified by: Kanata You
 * @Last Modified time: 2022-04-22 22:20:39
 */

import EditHelper from "./edit-helper";

export type SubtitleItemOption = {};

export type SubtitleItem = {
  beginTime: number;
  endTime: number;
  text: string;
  option: number;
};

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
        wave?: {
          dataUrl: string;
          width: number;
        } | 'failed';
      } | undefined;
    };
    helper: EditHelper | null;
    subtitle: {
      options: SubtitleItemOption[];
      data: SubtitleItem[];
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

export type SetAudioWaveAction = {
  type: 'SET_AUDIO_WAVE';
  payload: {
    wave: {
      dataUrl: string;
      width: number;
    } | 'failed';
  };
};

export type EditorContextAction = (
  | OpenVideoAction
  | SetOriginDurationAction
  | SetOriginAudioAction
  | SetAudioWaveAction
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
            },
            helper: null,
            subtitle: {
              options: [],
              data: []
            }
          },
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
            helper: new EditHelper(
              state.workspace.filename,
              action.payload.duration
            ),
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

    case 'SET_AUDIO_WAVE': {
      if (state.workspace?.origin.audio) {
        return {
          ...state,
          workspace: {
            ...state.workspace,
            origin: {
              ...state.workspace.origin,
              audio: {
                ...state.workspace.origin.audio,
                wave: action.payload.wave
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

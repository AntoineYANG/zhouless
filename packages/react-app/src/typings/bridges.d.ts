/*
 * @Author: Kanata You 
 * @Date: 2022-04-20 23:05:23 
 * @Last Modified by: Kanata You
 * @Last Modified time: 2022-04-21 23:23:56
 */

declare let shortcuts: {
  set: (name: string, cb: () => any) => void;
};

declare const electron: {
  close: () => Promise<void>;
  minimize: () => Promise<void>;
  maximize: () => Promise<void>;
  fullscreen: () => Promise<void>;
  isFullscreen: () => Promise<boolean>;
  reload: () => Promise<void>;
};

declare const darkMode: {
  toggle: () => Promise<boolean>;
};

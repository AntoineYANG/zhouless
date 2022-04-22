/*
 * @Author: Kanata You 
 * @Date: 2022-04-20 23:35:27 
 * @Last Modified by: Kanata You
 * @Last Modified time: 2022-04-22 21:49:27
 */

import { getLanguage, setLanguage } from '@locales/i18n';
import asyncEvent from '@utils/async_event';
import openFile from '@utils/open_file';
import safeClose, { safeReload, safeWait } from '@utils/safe_close';
import type EditorContext from '@views/context';
import type { EditorContextDispatcher } from '@views/context';
import type { MenuItemProps, MultipleMenuItemProps } from './menu-item';


const notImplemented = () => alert('This method is not implemented!');

export default class Menu {

  private readonly getContext: () => EditorContext;

  private readonly dispatcher: EditorContextDispatcher;

  constructor(getContext: () => EditorContext, dispatcher: EditorContextDispatcher) {
    this.getContext = getContext;
    this.dispatcher = dispatcher;
  }

  private static setShortcuts(menu: (MenuItemProps | MultipleMenuItemProps | '-')[], path?: string) {
    menu.forEach(e => {
      if (e === '-') {
        return;
      }

      const label = path ? `${path}.${e.label}` : `menu.${e.label}`;
      
      if ((e as MenuItemProps).callback && (e as MenuItemProps).accelerator) {
        shortcuts.set(
          label,
          () => {
            const disabled = (e as MenuItemProps).disabled?.() ?? false;
            console.log('shortcut:', label, (e as MenuItemProps), `disabled=${disabled}`);

            if (disabled) {
              return false;
            }

            return (e as MenuItemProps).callback();
          }
        );
      } else if ((e as MultipleMenuItemProps).subMenu?.length) {
        this.setShortcuts((e as MultipleMenuItemProps).subMenu, label);
      }
    });
  }

  getMenu(): (MenuItemProps | MultipleMenuItemProps)[] {
    const context = this.getContext();
    
    const menu: (MenuItemProps | MultipleMenuItemProps)[] = [{
      label: 'project',
      subMenu: [
        {
          label: 'open_video',
          callback: asyncEvent(async () => {
            if (await safeWait()) {
              const data = await openFile(['video/*']);

              if (data) {
                this.dispatcher({
                  type: 'OPEN_VIDEO',
                  payload: {
                    video: data
                  }
                });
              }
            }
          }),
          accelerator: 'Ctrl+N'
        },
        '-',
        {
          label: 'open_project',
          callback: notImplemented,
          accelerator: 'Ctrl+O',
        },
        {
          label: 'save_project',
          callback: notImplemented,
          accelerator: 'Ctrl+S',
          disabled: () => !Boolean(context.workspace),
        },
        {
          label: 'save_project_as',
          callback: notImplemented,
          accelerator: 'Ctrl+Shift+S',
          disabled: () => !Boolean(context.workspace),
        },
        '-',
        {
          label: 'close_project',
          callback: notImplemented,
          accelerator: 'Ctrl+W',
          disabled: () => !Boolean(context.workspace),
        },
        '-',
        {
          label: 'refresh',
          callback: safeReload,
          accelerator: 'Ctrl+Alt+R'
        },
        {
          label: 'exit',
          callback: safeClose,
          accelerator: 'Alt+W'
        },
      ]
    }, {
      label: 'appearance',
      subMenu: [
        {
          label: 'dark_mode',
          callback: darkMode.toggle,
          accelerator: 'Alt+D',
          checked: () => window.matchMedia('(prefers-color-scheme: dark)').matches
        },
        {
          label: 'language',
          subMenu: [
            {
              label: '$简体中文',
              callback: () => setLanguage('zh'),
              checked: () => getLanguage().toLowerCase().includes('zh'),
            },
            {
              label: '$English',
              callback: () => setLanguage('en'),
              checked: () => getLanguage().toLowerCase().includes('en'),
            },
            {
              label: '$日本語',
              callback: () => setLanguage('ja'),
              checked: () => getLanguage().toLowerCase().includes('ja'),
            },
          ]
        }
      ]
    }];

    Menu.setShortcuts(menu);

    return menu;
  }

}

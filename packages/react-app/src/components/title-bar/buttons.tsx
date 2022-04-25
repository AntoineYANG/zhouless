/*
 * @Author: Kanata You 
 * @Date: 2022-04-21 02:56:54 
 * @Last Modified by: Kanata You
 * @Last Modified time: 2022-04-24 16:56:26
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';


const ButtonElement = styled.div<{ warn?: boolean }>(({ warn = false }) => ({
  position: 'relative',
  outline: 'none',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  paddingInlineStart: '4px',
  paddingInlineEnd: '4px',
  WebkitAppRegion: 'none',
  textAlign: 'center',
  '@media (prefers-color-scheme: dark)': {
    color: '#ddd',

    '&:hover': warn ? {
      backgroundColor: '#f25042',
    } : {
      backdropFilter: 'brightness(3)',
    },
  },
  '@media (prefers-color-scheme: light)': {
    color: '#222',

    '&:hover': warn ? {
      backgroundColor: '#f25042',
    } : {
      backdropFilter: 'brightness(0.67)',
    },
  },

  '> svg': {
    width: '24px',
    height: '24px',

    '> path': {
      fill: 'none',
      '@media (prefers-color-scheme: dark)': {
        stroke: '#ccc',
      },
      '@media (prefers-color-scheme: light)': {
        stroke: '#444',
      },
    },
  },
}));

export interface ButtonProps {
  safeCloseProject: () => Promise<boolean>;
}

const Buttons: React.FC<ButtonProps> = React.memo(function Buttons ({
  safeCloseProject,
}) {
  const { t } = useTranslation();
  const [isFullscreen, setFullscreen] = React.useState<boolean>();

  React.useEffect(() => {
    electron.isFullscreen().then(setFullscreen);
  }, []);

  return (
    <React.Fragment>
      {
        isFullscreen !== undefined && (
          <ButtonElement
            onClick={e => {
              setFullscreen(undefined);
              electron.fullscreen().then(electron.isFullscreen).then(setFullscreen);
              e.stopPropagation();
            }}
            title={t('control.fullscreen')}
          >
            <svg viewBox="0 0 20 20">
              <path
                d="M4.2,5.2 L15.8,5.2 L15.8,14.8 L4.2,14.8 Z M4.2,13.9 H15.8"
              />
            </svg>
          </ButtonElement>
        )
      }
      {
        isFullscreen === false && (
          <React.Fragment>
            <ButtonElement
              onClick={e => {
                electron.minimize();
                e.stopPropagation();
              }}
              title={t('control.minimize')}
            >
              <svg viewBox="0 0 20 20">
                <path
                  d="M4.5,10 L15.5,10"
                />
              </svg>
            </ButtonElement>
            <ButtonElement
              onClick={e => {
                electron.maximize();
                e.stopPropagation();
              }}
              title={t('control.maximize')}
            >
              <svg viewBox="0 0 20 20">
                <path
                  d="M5,7 L5,15 L13,15 L13,7 Z M7,7 L7,5 L15,5 L15,13 L13,13"
                />
              </svg>
            </ButtonElement>
          </React.Fragment>
        )
      }
      <ButtonElement
        warn
        onClick={e => {
          e.stopPropagation();
          safeCloseProject().then(shouldClose => {
            if (shouldClose) {
              electron.close();
            }
          });
        }}
        title={t('control.close')}
      >
        <svg viewBox="0 0 20 20">
          <path
            d="M5,5.2 L15,14.8 M15,5.2 L5,14.8"
          />
        </svg>
      </ButtonElement>
    </React.Fragment>
  );
});


export default Buttons;

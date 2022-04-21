/*
 * @Author: Kanata You 
 * @Date: 2022-04-13 19:28:40 
 * @Last Modified by: Kanata You
 * @Last Modified time: 2022-04-21 04:37:16
 */

import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';

import openFile from '@utils/open_file';
import asyncEvent from '@utils/async_event';


const OpenVideoButtonElement = styled.div({
  flexGrow: 0.25,
  flexShrink: 0,
  width: '14.5vh',
  height: 'calc(12vh + 18%)',
  '@media (prefers-color-scheme: dark)': {
    color: '#999',
  },
  '@media (prefers-color-scheme: light)': {
    color: '#555',
  },
  border: '1px solid',
  userSelect: 'none',
  cursor: 'pointer',
  outline: 'none',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  '& *': {
    flexGrow: 0,
    flexShrink: 0,
    pointerEvents: 'none',
  },
  '&:focus, &:hover': {
    borderRadius: '12px',
    backgroundColor: '#8885',
    transform: 'scale(1.05)',
  },
  transition: 'color 200ms, border-radius 200ms, transform 200ms'
});

const ButtonSvg = styled.svg({
  width: '4em',
  height: '4em'
});

const ButtonSvgPath = styled.path({
  '@media (prefers-color-scheme: dark)': {
    stroke: '#999',
  },
  '@media (prefers-color-scheme: light)': {
    stroke: '#555',
  },
  strokeWidth: '1px',
  fill: 'none'
});

const ButtonText = styled.span({
  margin: '0.4em 0 0.2em'
});

export interface OpenVideoButtonProps {
  openVideo: (video: File) => void;
}

/**
 * 当未打开视频时，展示此组件，点击后打开视频.
 */
const OpenVideoButton: React.FC<OpenVideoButtonProps> = React.memo(function OpenVideoButton ({
  openVideo
}) {
  const { t } = useTranslation();

  const handleClick = React.useCallback(
    asyncEvent(async () => {
      const data = await openFile(['video/*']);

      if (data) {
        openVideo(data);
      }
    }),
    [openVideo]
  );

  return (
    <OpenVideoButtonElement
      aria-label={t('open_video')}
      role="button"
      tabIndex={0}
      onClick={handleClick}
    >
      <ButtonSvg viewBox="0 0 20 20">
        <ButtonSvgPath d="M4,10 H16 M10,4 V16" />
      </ButtonSvg>
      <ButtonText>
        {t('open_video')}
      </ButtonText>
    </OpenVideoButtonElement>
  );
});


export default OpenVideoButton;

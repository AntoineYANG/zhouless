/*
 * @Author: Kanata You 
 * @Date: 2022-04-23 18:56:45 
 * @Last Modified by: Kanata You
 * @Last Modified time: 2022-04-25 16:22:22
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';


const TextCellElement = styled.textarea({
  flexGrow: 1,
  flexShrink: 1,
  minHeight: '1.6em',
  borderWidth: '1px',
  borderBlockStartStyle: 'none',
  borderBlockEndStyle: 'solid',
  borderInlineStartStyle: 'none',
  borderInlineEndStyle: 'solid',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  display: 'block',
  paddingBlock: '4px',
  paddingInline: '4px',
  outline: 'none',
  backgroundColor: 'transparent',
  color: 'inherit',
  fontFamily: 'inherit',
  fontSize: 'inherit',
  lineHeight: 'inherit',
  letterSpacing: 'inherit',
  resize: 'none',
  whiteSpace: 'pre-wrap',
  lineBreak: 'anywhere',
  wordBreak: 'break-all',
  cursor: 'text',

  '@media (prefers-color-scheme: dark)': {
    borderColor: '#6a6a6a',
  },
  '@media (prefers-color-scheme: light)': {
    borderColor: '#aaa',
  },
});

export interface TextCellProps {
  /** 当前记录的值 */
  value: string;
  /** 输入更新监听 */
  onValueChange: (value: string) => void;
}

let isTabPressing = false;

/**
 * 文本显示&编辑框.
 */
const TextCell: React.FC<TextCellProps> = React.memo(function TextCell ({
  value,
  onValueChange,
}) {
  const id = React.useId();
  const { t } = useTranslation();
  const [height, setHeight] = React.useState(0);

  React.useLayoutEffect(() => {
    setHeight(0);
  }, [value, setHeight]);

  // 更新文本框高度（值更新后高度被设为 0，以保证新的高度小于上一高度时可以更新）
  React.useLayoutEffect(() => {
    const element = document.getElementById(id);

    if (element && height === 0) {
      setHeight(Math.floor(element.scrollHeight - /** paddingBlock */ 8));
    }
  }, [height, setHeight, id]);

  const handleValueChange = React.useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const data = e.target.value.replace(/[\r\n]+/g, ' '); // 不含换行

    if (data !== value) {
      onValueChange(data);
    }
  }, [onValueChange, value]);

  const handleKeyDown = React.useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key !== 'Alt') {
      e.stopPropagation();
    }

    isTabPressing = e.key === 'Tab';

    if (e.key === 'Enter') {
      e.preventDefault(); // 禁止换行
    }

    return;
  }, []);

  const handleKeyUp = React.useCallback(() => {
    isTabPressing = false;
  }, []);

  const handleFocus = React.useCallback(() => {
    const content = (document.getElementById(id) as HTMLTextAreaElement)?.value;
    
    if (content && isTabPressing) {
      (document.getElementById(id) as HTMLTextAreaElement)?.setSelectionRange(
        0, content.length, 'forward'
      );
    }
  }, [id, isTabPressing]);

  return (
    <TextCellElement
      id={id}
      tabIndex={0}
      value={value}
      placeholder={t('empty_text')}
      spellCheck="false"
      onChange={handleValueChange}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      onFocus={handleFocus}
      style={{
        height
      }}
    />
  );
});


export default TextCell;

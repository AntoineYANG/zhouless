/*
 * @Author: Kanata You 
 * @Date: 2022-04-23 18:56:45 
 * @Last Modified by: Kanata You
 * @Last Modified time: 2022-04-23 21:08:54
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';


const TextCellElement = styled.textarea({
  display: 'block',
  minHeight: '1.6em',
  outline: 'none',
  flexGrow: 1,
  flexShrink: 1,
  paddingBlock: '4px',
  paddingInline: '4px',
  border: 'none',
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
  overflow: 'hidden',
  cursor: 'text',
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
  const [data, setData] = React.useState(value);
  const [height, setHeight] = React.useState(0);

  React.useLayoutEffect(() => {
    setHeight(0);
  }, [data, setHeight]);

  // 更新文本框高度（值更新后高度被设为 0，以保证新的高度小于上一高度时可以更新）
  React.useLayoutEffect(() => {
    const element = document.getElementById(id);

    if (element && height === 0) {
      setHeight(Math.floor(element.scrollHeight - /** paddingBlock */ 8));
    }
  }, [height, setHeight, id]);

  const handleValueChange = React.useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setData(e.target.value.replace(/[\r\n]+/g, ' ')); // 不含换行
  }, [setData]);

  const handleKeyDown = React.useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    isTabPressing = e.key === 'Tab';

    if (e.key === 'Enter') {
      e.preventDefault(); // 禁止换行
    }

    if (e.key !== 'Alt') {
      e.stopPropagation();
    }
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
      value={data}
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

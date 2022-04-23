/*
 * @Author: Kanata You 
 * @Date: 2022-04-22 20:33:57 
 * @Last Modified by: Kanata You
 * @Last Modified time: 2022-04-23 21:12:34
 */

import React from 'react';
import styled from 'styled-components';

import type EditorContext from '@views/context';
import { useTranslation } from 'react-i18next';
import ResizeBar from '@components/resize-bar';
import useLocalStorage from '@utils/use_local_storage';
import EditHelper from '@views/edit-helper';
import formatTime from '@utils/format_time';
import type { SubtitleItem } from '@views/context';
import TextCell from './text-cell';


export interface EditorProps {
  context: React.Context<EditorContext>;
}

const EditorContainer = styled.article({
  flexGrow: 1,
  flexShrink: 1,
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
});

const EditorTable = styled.div({
  flexGrow: 1,
  flexShrink: 1,
  overflow: 'hidden scroll',
  width: '100%',
  fontSize: '1.1rem',
  lineHeight: '1.6em',
  paddingBlockEnd: '3em',

  '@media (prefers-color-scheme: dark)': {
    color: '#9df',
  },
  '@media (prefers-color-scheme: light)': {
    color: '#222',
  },
});

const EditorTableRow = styled.div({
  flexGrow: 0,
  flexShrink: 0,
  width: '100%',
  minHeight: '1.6em',
  display: 'flex',
  flexDirection: 'row',
});

const EditorTableCell = styled.div({
  flexGrow: 0,
  flexShrink: 0,
  minHeight: '1.6em',
  borderWidth: '1px',
  borderBlockEndStyle: 'solid',
  borderInlineEndStyle: 'solid',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'pre',
  display: 'flex',
  
  ':nth-child(1)': {
    userSelect: 'none',
    width: '18px',
    paddingBlock: '0.2em',
    paddingInline: '2px',
    borderInlineStartStyle: 'solid',
  },

  ':nth-child(4)': {
    flexGrow: 1,
    flexShrink: 1,
    borderColor: '#6a6a6a',
  },

  '@media (prefers-color-scheme: dark)': {
    borderColor: '#6a6a6a',
  },
  '@media (prefers-color-scheme: light)': {
    borderColor: '#aaa',
  },
});

const EditorTableHeaderRow = styled.div({
  display: 'flex',
  flexDirection: 'row',
  fontSize: '1rem',
  lineHeight: '1.2em',
  cursor: 'default',
  userSelect: 'none',

  '@media (prefers-color-scheme: dark)': {
    color: '#9df',
  },
  '@media (prefers-color-scheme: light)': {
    color: '#222',
  },
});

const EditorTableHeader = styled.div({
  position: 'relative',
  borderWidth: '1px',
  borderBlockStartStyle: 'solid',
  borderBlockEndStyle: 'solid',
  borderInlineEndStyle: 'solid',
  paddingBlock: '0.2em',
  paddingInline: '4px',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'pre',

  ':nth-child(1)': {
    width: '18px',
    paddingInline: '2px',
    borderInlineStartStyle: 'solid',
  },
  ':nth-child(4)': {
    flexGrow: 1,
  },

  '@media (prefers-color-scheme: dark)': {
    borderColor: '#6a6a6a',
  },
  '@media (prefers-color-scheme: light)': {
    borderColor: '#aaa',
  },
});

const ButtonAppendItem = styled.div({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  height: '100%',
  fontSize: '14px',
  fontWeight: 800,
  lineHeight: '16px',
  cursor: 'pointer',
  color: '#0a4',
  border: '1px solid #111',
  backgroundColor: '#eee',
});

const Editor: React.FC<EditorProps> = React.memo(function Editor ({
  context,
}) {
  const { t } = useTranslation();
  const [scrollView, setScrollView] = React.useState<HTMLDivElement>();
  const [resizeContainer, setResizeContainer] = React.useState<HTMLDivElement>();
  const [resizeCol1, setResizeCol1] = React.useState<HTMLDivElement>();
  const [col1W, setCol1W] = useLocalStorage(
    'col_time_width',
    window.innerWidth * 0.12
  );
  const { workspace } = React.useContext(context);

  const [data, setData] = React.useState<SubtitleItem[]>([]);

  const helper = workspace?.helper;

  React.useEffect(() => {
    if (helper) {
      const update = (h: EditHelper) => {
        setData(h.getSubtitles());
      };

      helper.subscribe(update);

      return () => {
        helper.unsubscribe(update);
      };
    }

    return;
  }, [helper, setData]);

  React.useEffect(() => {
    const last = scrollView?.children?.[scrollView.childNodes.length - 1];

    if (last) {
      last.scrollIntoView();
    }
  }, [scrollView?.children, helper?.getPreview?.(), helper?.getSubtitles?.()?.length]);

  return (
    <EditorContainer>
      <EditorTableHeaderRow
        ref={e => e && setResizeContainer(e)}
      >
        <EditorTableHeader />
        <EditorTableHeader
          ref={e => e && setResizeCol1(e)}
          style={{
            width: col1W
          }}
        >
          {t('begin_time')}
          <ResizeBar
            direction="ew"
            container={resizeContainer}
            target={resizeCol1}
            onResize={setCol1W}
            min={0.08}
            max={0.2}
          />
        </EditorTableHeader>
        <EditorTableHeader
          style={{
            width: col1W
          }}
        >
          {t('end_time')}
        </EditorTableHeader>
        <EditorTableHeader>
          {t('subtitle_text')}
        </EditorTableHeader>
      </EditorTableHeaderRow>
      {
        helper && (
          <EditorTable
            ref={e => e && setScrollView(e)}
          >
            {
              data.map((st, i) => (
                <EditorTableRow key={i} >
                  <EditorTableCell>
                    {i + 1}
                  </EditorTableCell>
                  <EditorTableCell
                    style={{
                      width: col1W
                    }}
                  >
                    {formatTime(st.beginTime)}
                  </EditorTableCell>
                  <EditorTableCell
                    style={{
                      width: col1W
                    }}
                    >
                    {formatTime(st.endTime)}
                  </EditorTableCell>
                  <EditorTableCell>
                    <TextCell
                      value={st.text}
                      onValueChange={console.log} // FIXME:
                    />
                  </EditorTableCell>
                </EditorTableRow>
              ))
            }
            {/* 新增一条 */}
            {
              helper.getPreview() ? (
                <EditorTableRow>
                  <EditorTableCell>
                    {data.length + 1}
                  </EditorTableCell>
                  <EditorTableCell
                    style={{
                      width: col1W
                    }}
                  >
                    {formatTime(helper.getPreview()?.beginTime ?? NaN)}
                  </EditorTableCell>
                  <EditorTableCell
                    style={{
                      width: col1W
                    }}
                  >
                    {formatTime(helper.getPreview()?.endTime ?? NaN)}
                  </EditorTableCell>
                  <EditorTableCell>
                    {''}
                  </EditorTableCell>
                </EditorTableRow>
              ) : (
                <EditorTableRow>
                  <EditorTableCell
                    role="button"
                    onClick={() => helper.appendItem(NaN, NaN)}
                  >
                    <ButtonAppendItem>
                      {'+'}
                    </ButtonAppendItem>
                  </EditorTableCell>
                  <EditorTableCell
                    style={{
                      width: col1W
                    }}
                  >
                    {formatTime(NaN)}
                  </EditorTableCell>
                  <EditorTableCell
                    style={{
                      width: col1W
                    }}
                    >
                    {formatTime(NaN)}
                  </EditorTableCell>
                  <EditorTableCell>
                    {''}
                  </EditorTableCell>
                </EditorTableRow>
              )
            }
          </EditorTable>
        )
      }
    </EditorContainer>
  );
});

export default Editor;

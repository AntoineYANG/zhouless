/*
 * @Author: Kanata You 
 * @Date: 2022-04-22 20:33:57 
 * @Last Modified by: Kanata You
 * @Last Modified time: 2022-04-25 19:35:15
 */

import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';

import type EditorContext from '@views/context';
import ResizeBar from '@components/resize-bar';
import useLocalStorage from '@utils/use_local_storage';
import type EditHelper from '@views/edit-helper';
import formatTime from '@utils/format_time';
import type { SubtitleItem } from '@views/context';
import TextCell from './text-cell';
import TimeCell from './time-cell';


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
  position: 'relative',
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
  paddingBlock: '4px',
  paddingInline: '4px',
  
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
  outline: 'none',
  flexGrow: 0,
  flexShrink: 0,
  display: 'inline-block',
  width: '16px',
  height: '16px',
  marginBlockStart: '4px',
  borderRadius: '50%',
  cursor: 'pointer',
  color: '#0a4',
  '@media (prefers-color-scheme: dark)': {
    backgroundColor: '#1e1e1e',
    border: '1px solid #44c6',
    boxShadow: '1px 1px 5px -1px #0008, inset 6px 5px 12px 2px #ffffff0c',

    ':hover': {
      boxShadow: '1px 1px 5px -1px #0008, inset 6px 5px 12px 2px #0002',
    },
  },
  '@media (prefers-color-scheme: light)': {
    backgroundColor: '#e4e4e4',
    border: '1px solid #6666',
    boxShadow: '1px 1px 5px -1px #0008, inset 6px 5px 12px 2px #fff',

    ':hover': {
      boxShadow: '1px 1px 5px -1px #0008, inset 6px 5px 12px 2px #0002',
    },
  },
  transition: 'border-color 200ms, box-shader 200ms, background-color 200ms',

  '& > svg': {
    width: '98%',
    height: '98%',
    borderRadius: '50%',
    pointerEvents: 'none',

    '& > path': {
      fill: 'none',

      '@media (prefers-color-scheme: dark)': {
        stroke: '#aaa',
      },
      '@media (prefers-color-scheme: light)': {
        stroke: '#555',
      },
    }
  },
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

  // 代理撤销和重做
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && ['y', 'z'].includes(e.key)) {
        e.preventDefault();
        e.stopPropagation();
  
        switch (e.key) {
          case 'y': {
            return edit.redo();
          }
          case 'z': {
            return edit.undo();
          }
        }
      }

      return;
    }

    document.body.addEventListener('keydown', handleKeyDown, {
      capture: true,
      passive: false,
    });

    return () => {
      document.body.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

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
                  <TimeCell
                    value={st}
                    onValueChange={val => {
                      if (helper.isAutoSet) {
                        // 被撤销/重做触发
                        return;
                      } else if (
                        [val.beginTime, val.endTime].some(d => (
                          d < 0 || d > (workspace.origin.duration ?? 10)
                        ))
                      ) {
                        // 超出范围
                        return;
                      } else if (val.endTime - val.beginTime < 0.1) {
                        // 起始时间超过结束时间或时间不够 100ms
                        return helper.writeDuration(i, {
                          beginTime: val.beginTime,
                          endTime: val.beginTime + 0.1
                        });
                      }

                      helper.writeDuration(i, val);
                    }}
                    width={col1W}
                  />
                  <TextCell
                    value={st.text}
                    onValueChange={val => {
                      if (helper.isAutoSet) {
                        // 被撤销/重做触发
                        return;
                      }

                      helper.writeText(i, val);
                    }}
                  />
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
                    onClick={() => {
                      const video = document.querySelector('video') as HTMLVideoElement | null;

                      if (video) {
                        const time = video.currentTime;
                        helper.appendItem(time, time + 5);
                      }
                    }}
                  >
                    <ButtonAppendItem
                      tabIndex={-1}
                      title={t('append_subtitle')}
                    >
                      <svg viewBox="0 0 20 20" >
                        <path
                          d="M5,10 H15 M10,5 V15"
                        />
                      </svg>
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

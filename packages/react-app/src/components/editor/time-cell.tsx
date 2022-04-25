/*
 * @Author: Kanata You 
 * @Date: 2022-04-23 18:56:45 
 * @Last Modified by: Kanata You
 * @Last Modified time: 2022-04-25 20:36:53
 */

import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';

import formatTime, { resolveTime, splitTime } from '@utils/format_time';
import type { SubtitleItem } from '@views/context';


const TimeCellContainer = styled.div({
  position: 'relative',
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

  outline: 'none',
  paddingBlock: '4px',
  paddingInline: '4px',
  cursor: 'text',

  '@media (prefers-color-scheme: dark)': {
    borderColor: '#6a6a6a',
  },
  '@media (prefers-color-scheme: light)': {
    borderColor: '#aaa',
  },
});

const TimeCellDialog = styled.div({
  position: 'fixed',
  zIndex: 8,
  left: '10vw',
  transform: 'translateY(-100%) translateY(-6px)',
  display: 'flex',
  flexDirection: 'column',
  paddingBlockStart: '10px',
  paddingBlockEnd: '10px',
  paddingInlineStart: '10px',
  paddingInlineEnd: '10px',
  border: '1px solid',
  boxShadow: '5px 6px 3px 1px #0008',

  '@media (prefers-color-scheme: dark)': {
    borderColor: '#6a6a6a',
    backdropFilter: 'brightness(0.9) blur(16px)',
  },
  '@media (prefers-color-scheme: light)': {
    borderColor: '#aaa',
    backdropFilter: 'brightness(1.2) blur(16px)',
  },

  '::after': {
    position: 'absolute',
    content: '""',
    width: '20px',
    height: '10px',
    bottom: '-12px',
    left: '22%',
    border: '1px solid',
    WebkitMaskImage: '-webkit-linear-gradient(-60deg, #000 50%, #0000 50%)',

    '@media (prefers-color-scheme: dark)': {
      borderColor: '#6a6a6a',
      borderBlockStartColor: '#ccc',
      backgroundColor: '#333c',
      backgroundImage: 'linear-gradient(-30deg, #6a6a6a 55%, transparent 50%)',
    },
    '@media (prefers-color-scheme: light)': {
      borderColor: '#aaa',
      borderBlockStartColor: '#fff',
      backgroundColor: '#fffe',
      backgroundImage: 'linear-gradient(-30deg, #aaa 55%, transparent 50%)',
    },
  },
});

const TimeCellBody = styled.div({
  flexGrow: 0,
  flexShrink: 0,
  width: '100%',
  height: '40px',
});

const TimeCellInputGroup = styled.div({
  flexGrow: 0,
  flexShrink: 0,
  width: '100%',
  maxWidth: '60vw',
  minHeight: '28px',
  fontSize: '12px',
  lineHeight: '1.6em',
  display: 'flex',
  flexDirection: 'row',
  flexWrap: 'wrap',
  alignItems: 'center',
  justifyContent: 'space-around',
});

const TimeCellInputUnit = styled.div({
  flexGrow: 0,
  flexShrink: 0,
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'baseline',
  marginBlock: '0.25em',
  marginInline: '1em',

  '> &': {
    flexGrow: 0,
    flexShrink: 0,
    paddingBlock: '2px',
    marginInline: '2px',
  },
});

const TimeCellLabel = styled.label({
  height: '1.4em',
  paddingInline: '0',

  '::after': {
    content: '":"',
    marginInlineStart: '2px',
    marginInlineEnd: '0.8em',
  },

  '&[role=checkbox]': {
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',

    '& > *': {
      flexGrow: 0,
      flexShrink: 0,
    },

    '& > span::after': {
      content: '""',
      display: 'block',
      width: '0.6em',
    },

    '& > svg': {
      width: '18px',
      height: '18px',

      '& > path': {
        fill: 'none',
        stroke: '#888',
        strokeWidth: '1.6px',
      },
    },

    '&::after': {
      display: 'none',
    },

    '&[aria-checked=false]': {
      opacity: 0.5,
    },
  },
});

const TimeCellInput = styled.input({
  height: '1.4em',
  paddingBlock: '0.1em',
  minWidth: '1.2em',
  display: 'block',
  outline: 'none',
  marginInline: '2px',
  paddingInline: '2px',
  border: '1px solid',
  backgroundColor: 'transparent',
  color: 'inherit',
  fontFamily: 'inherit',
  fontSize: 'inherit',
  letterSpacing: 'inherit',
  overflow: 'hidden',
  cursor: 'text',
  borderRadius: '0.4em',
  textAlign: 'center',

  ':last-child': {
    width: '1.8em',
  },

  '[aria-invalid=true]': {
    borderColor: '#f00',
    color: '#e22',
  },
  '@media (prefers-color-scheme: dark)': {
    borderColor: '#6a6a6a',
  },
  '@media (prefers-color-scheme: light)': {
    borderColor: '#aaa',
  },
});

const Input: React.FC<{
  value: number;
  size?: 2 | 3 | 'inf';
  onChange: (t: number) => void;
  onUpperFlow?: () => void;
  onLowerFlow?: () => void;
}> = React.memo(function Input ({
  value,
  size = 2,
  onChange,
  onUpperFlow,
  onLowerFlow,
}) {
  const id = React.useId();
  const [width, setWidth] = React.useState(0);

  React.useLayoutEffect(() => {
    setWidth(0);
  }, [value, setWidth]);

  // 更新输入框宽度（值更新后宽度被设为 0，以保证新的宽度小于上一宽度时可以更新）
  React.useLayoutEffect(() => {
    const element = document.getElementById(id);

    if (element && width === 0) {
      setWidth(Math.floor(element.scrollWidth - /** paddingInline */ 4));
    }
  }, [width, setWidth, id]);

  React.useLayoutEffect(() => {
    const element = document.getElementById(id) as HTMLInputElement | null;
    const displayValue = element?.value;

    if (displayValue && /^\d+$/.test(displayValue)) {
      const num = parseInt(displayValue, 10);
  
      const isValid = {
        [2]: (n: number) => n < 60,
        [3]: (n: number) => n < 1000,
        ['inf']: (n: number) => n,
      }[size](num);

      element!.setAttribute('aria-invalid', isValid ? 'false' : 'true');
    } else if (element) {
      element!.setAttribute('aria-invalid', 'false');
    }
  }, [size]);

  const handleChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.currentTarget.value === '') {
      return onChange(0);
    }

    const num = {
      [2]: /[0-9]{1,2}/,
      [3]: /[0-9]{1,3}/,
      ['inf']: /[0-9]+/,
    }[size].exec(e.currentTarget.value)?.[0];

    if (!num) {
      return;
    }

    const valid = {
      [2]: (n: number) => Math.min(59, n),
      [3]: (n: number) => parseFloat(`0.${n}`) * 1000,
      ['inf']: (n: number) => n,
    }[size](parseInt(num, 10));

    onChange(valid);

    return size === 3 ? `0.${num}` : num;
  }, [size, onChange]);

  let flowed = false;

  const handleKeyDown = React.useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (['ArrowUp', 'ArrowDown'].includes(e.key)) {
      const max = {
        [2]: 60,
        [3]: 1000,
        ['inf']: Infinity,
      }[size];

      switch (e.key) {
        case 'ArrowUp': {
          if (value + 1 >= max) {
            onChange(0);
            
            if (!flowed) {
              flowed = true;
              onUpperFlow?.();
            }
          } else {
            onChange(value + 1);
          }

          break;
        }
        case 'ArrowDown': {
          if (value - 1 < 0) {
            if (Number.isFinite(max)) {
              break;
            }

            onChange(max - 1);
            
            if (!flowed) {
              flowed = true;
              onLowerFlow?.();
            }
          } else {
            onChange(value - 1);
          }

          break;
        }
      }

      e.preventDefault();
    }
  }, [value, size, onChange, onUpperFlow, onLowerFlow, flowed]);

  return (
    <TimeCellInput
      id={id}
      value={value}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      style={{
        width
      }}
    />
  );
});

export interface TimeCellProps {
  /** 当前记录的值 */
  value: Pick<SubtitleItem, 'beginTime' | 'endTime'>;
  /** 输入更新监听 */
  onValueChange: (value: Pick<SubtitleItem, 'beginTime' | 'endTime'>) => void;
  width: number;
}

/**
 * 时间显示&编辑框.
 */
const TimeCell: React.FC<TimeCellProps> = React.memo(function TextCell ({
  value,
  onValueChange,
  width,
}) {
  const { t } = useTranslation();
  const [isEditing, setEditing] = React.useState(false);
  const [lockLength, setLockLength] = React.useState(true);

  React.useEffect(() => {
    if (isEditing) {
      const close = () => {
        setEditing(false);
      };

      document.addEventListener('click', close);

      return () => {
        document.removeEventListener('click', close);
      };
    }

    return;
  }, [isEditing, setEditing]);

  const handleClickCell = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isEditing) {
      e.stopPropagation();
      setEditing(true);
    }
  };

  const beginTime = splitTime(value.beginTime);
  const endTime = splitTime(value.endTime);

  return (
    <React.Fragment>
      <TimeCellContainer
        onClick={handleClickCell}
        style={{
          width
        }}
      >
        {formatTime(value.beginTime)}
      </TimeCellContainer>
      <TimeCellContainer
        onClick={handleClickCell}
        style={{
          width
        }}
      >
        {formatTime(value.endTime)}
      </TimeCellContainer>
      {
        isEditing && (
          <TimeCellDialog
            onClick={e => e.stopPropagation()}
          >
            <TimeCellBody>
            </TimeCellBody>
            <TimeCellInputGroup>
              <TimeCellInputUnit>
                <TimeCellLabel>
                  {t('begin_time')}
                </TimeCellLabel>
                <Input
                  size="inf"
                  value={beginTime[0]}
                  onChange={h => {
                    const t = resolveTime(
                      [h, beginTime[1], beginTime[2], beginTime[3]]
                    );
                    onValueChange({
                      beginTime: t,
                      endTime: lockLength ? value.endTime + (t - value.beginTime) : value.endTime
                    });
                  }}
                />
                <span>:</span>
                <Input
                  value={beginTime[1]}
                  onChange={min => {
                    const t = resolveTime(
                      [beginTime[0], min, beginTime[2], beginTime[3]]
                    );
                    onValueChange({
                      beginTime: t,
                      endTime: lockLength ? value.endTime + (t - value.beginTime) : value.endTime
                    });
                  }}
                  onUpperFlow={() => {
                    const t = resolveTime(
                      [beginTime[0] + 1, beginTime[1], beginTime[2], beginTime[3]]
                    );
                    onValueChange({
                      beginTime: t,
                      endTime: lockLength ? value.endTime + (t - value.beginTime) : value.endTime
                    });
                  }}
                  onLowerFlow={() => {
                    if (beginTime[0] === 0) {
                      return;
                    }

                    const t = resolveTime(
                      [beginTime[0] - 1, beginTime[1], beginTime[2], beginTime[3]]
                    );
                    onValueChange({
                      beginTime: t,
                      endTime: lockLength ? value.endTime + (t - value.beginTime) : value.endTime
                    });
                  }}
                />
                <span>:</span>
                <Input
                  value={beginTime[2]}
                  onChange={s => {
                    const t = resolveTime(
                      [beginTime[0], beginTime[1], s, beginTime[3]]
                    );
                    onValueChange({
                      beginTime: t,
                      endTime: lockLength ? value.endTime + (t - value.beginTime) : value.endTime
                    });
                  }}
                  onUpperFlow={() => {
                    const t = resolveTime(
                      [beginTime[0], beginTime[1] + 1, beginTime[2], beginTime[3]]
                    );
                    onValueChange({
                      beginTime: t,
                      endTime: lockLength ? value.endTime + (t - value.beginTime) : value.endTime
                    });
                  }}
                  onLowerFlow={() => {
                    if (beginTime[0] === 0 && beginTime[1] === 0) {
                      return;
                    }

                    const t = resolveTime(
                      [beginTime[0], beginTime[1] - 1, beginTime[2], beginTime[3]]
                    );
                    onValueChange({
                      beginTime: t,
                      endTime: lockLength ? value.endTime + (t - value.beginTime) : value.endTime
                    });
                  }}
                />
                <span>.</span>
                <Input
                  size={3}
                  value={beginTime[3]}
                  onChange={ms => {
                    const t = resolveTime(
                      [beginTime[0], beginTime[1], beginTime[2], ms]
                    );
                    onValueChange({
                      beginTime: t,
                      endTime: value.endTime
                    });
                  }}
                  onUpperFlow={() => {
                    const t = resolveTime(
                      [beginTime[0], beginTime[1], beginTime[2] + 1, beginTime[3]]
                    );
                    onValueChange({
                      beginTime: t,
                      endTime: value.endTime
                    });
                  }}
                  onLowerFlow={() => {
                    if (beginTime[0] === 0 && beginTime[1] === 0 && beginTime[2] === 0) {
                      return;
                    }

                    const t = resolveTime(
                      [beginTime[0], beginTime[1], beginTime[2] - 1, beginTime[3]]
                    );
                    onValueChange({
                      beginTime: t,
                      endTime: value.endTime
                    });
                  }}
                />
              </TimeCellInputUnit>
              <TimeCellInputUnit>
                <TimeCellLabel>
                  {t('end_time')}
                </TimeCellLabel>
                <Input
                  size="inf"
                  value={endTime[0]}
                  onChange={h => {
                    const t = resolveTime(
                      [h, endTime[1], endTime[2], endTime[3]]
                    );
                    onValueChange({
                      beginTime: value.beginTime,
                      endTime: t
                    });
                  }}
                />
                <span>:</span>
                <Input
                  value={endTime[1]}
                  onChange={min => {
                    const t = resolveTime(
                      [endTime[0], min, endTime[2], endTime[3]]
                    );
                    onValueChange({
                      beginTime: value.beginTime,
                      endTime: t
                    });
                  }}
                  onUpperFlow={() => {
                    const t = resolveTime(
                      [endTime[0] + 1, endTime[1], endTime[2], endTime[3]]
                    );
                    onValueChange({
                      beginTime: value.beginTime,
                      endTime: t
                    });
                  }}
                  onLowerFlow={() => {
                    if (endTime[0] === 0) {
                      return;
                    }

                    const t = resolveTime(
                      [endTime[0] - 1, endTime[1], endTime[2], endTime[3]]
                    );
                    onValueChange({
                      beginTime: value.beginTime,
                      endTime: t
                    });
                  }}
                />
                <span>:</span>
                <Input
                  value={endTime[2]}
                  onChange={s => {
                    const t = resolveTime(
                      [endTime[0], endTime[1], s, endTime[3]]
                    );
                    onValueChange({
                      beginTime: value.beginTime,
                      endTime: t
                    });
                  }}
                  onUpperFlow={() => {
                    const t = resolveTime(
                      [endTime[0], endTime[1] + 1, endTime[2], endTime[3]]
                    );
                    onValueChange({
                      beginTime: value.beginTime,
                      endTime: t
                    });
                  }}
                  onLowerFlow={() => {
                    if (endTime[0] === 0 && endTime[1] === 0) {
                      return;
                    }

                    const t = resolveTime(
                      [endTime[0], endTime[1] - 1, endTime[2], endTime[3]]
                    );
                    onValueChange({
                      beginTime: value.beginTime,
                      endTime: t
                    });
                  }}
                />
                <span>.</span>
                <Input
                  size={3}
                  value={endTime[3]}
                  onChange={ms => {
                    const t = resolveTime(
                      [endTime[0], endTime[1], endTime[2], ms]
                    );
                    onValueChange({
                      beginTime: value.beginTime,
                      endTime: t
                    });
                  }}
                  onUpperFlow={() => {
                    const t = resolveTime(
                      [endTime[0], endTime[1], endTime[2] + 1, endTime[3]]
                    );
                    onValueChange({
                      beginTime: value.beginTime,
                      endTime: t
                    });
                  }}
                  onLowerFlow={() => {
                    if (endTime[0] === 0 && endTime[1] === 0 && endTime[2] === 0) {
                      return;
                    }

                    const t = resolveTime(
                      [endTime[0], endTime[1], endTime[2] - 1, endTime[3]]
                    );
                    onValueChange({
                      beginTime: value.beginTime,
                      endTime: t
                    });
                  }}
                />
              </TimeCellInputUnit>
              <TimeCellLabel
                onClick={() => setLockLength(!lockLength)}
                tabIndex={-1}
                role="checkbox"
                aria-checked={lockLength}
              >
                <span>
                  {t('lock_length')}
                </span>
                <svg viewBox="0 0 20 20">
                  <path
                    d={
                      `M5,10 V18 H15 V10 Z M6.5,10 A3.5,5.5,0,1,1,${
                        lockLength ? '13.5,10' : '13,5'
                      }`
                    }
                  />
                </svg>
              </TimeCellLabel>
            </TimeCellInputGroup>
          </TimeCellDialog>
        )
      }
    </React.Fragment>
  );
});


export default TimeCell;

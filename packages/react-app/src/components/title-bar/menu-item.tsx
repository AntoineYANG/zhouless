/*
 * @Author: Kanata You 
 * @Date: 2022-04-20 23:29:32 
 * @Last Modified by: Kanata You
 * @Last Modified time: 2022-04-21 23:34:02
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';


export interface MenuItemProps {
  label: string;
  callback: () => (Promise<any> | any);
  disabled?: () => boolean;
  accelerator?: string;
  checked?: () => boolean;
};

export interface MultipleMenuItemProps {
  label: string;
  subMenu: (MenuItemProps | MultipleMenuItemProps | '-')[];
};

const MenuItemElement = styled.div<{ expanded: boolean; disabled: boolean }>(({ expanded, disabled }) => ({
  position: 'relative',
  outline: 'none',
  paddingInlineStart: '0.55em',
  paddingInlineEnd: '0.55em',
  WebkitAppRegion: 'none',
  '@media (prefers-color-scheme: dark)': {
    color: disabled ? '#888' : '#ddd',
  },
  '@media (prefers-color-scheme: light)': {
    color: disabled ? '#888' : '#222',
  },
  [`&:hover, &:focus${expanded ? ', &' : ''}`]: disabled ? {} : {
    backgroundColor: '#6666',
    '@media (prefers-color-scheme: dark)': {
      color: '#eee',
    },
    '@media (prefers-color-scheme: light)': {
      color: '#111',
    },
  },
}));

const MenuGroupPlacer = styled.div<{ pos: 'right' | 'bottom' }>(({ pos }) => ({
  position: 'relative',
  ...(pos === 'bottom' ? {
    left: '-0.5em',
    top: '27px',
  } : {
    left: '100%',
    top: 0,
  }),
  width: 0,
  height: 0,
}));

const MenuGroupElement = styled.div<{ deep: boolean }>(({ deep }) => ({
  position: 'absolute',
  left: 0,
  zIndex: 1,
  padding: '0.32em 0',
  '@media (prefers-color-scheme: dark)': {
    backgroundColor: deep ? '#0006' : '#0001',
    backdropFilter: 'brightness(0.75) blur(6px)',
    boxShadow: '2px 3px 2px 0px #0008',
  },
  '@media (prefers-color-scheme: light)': {
    backgroundColor: deep ? '#fff8' : '#fff1',
    backdropFilter: 'brightness(1.5) blur(6px)',
    boxShadow: '2px 3px 2px 0px #0002',
  },
}));

const MenuNodeElement = styled.div<{ expanded: boolean; disabled: boolean }>(({ expanded, disabled }) => ({
  outline: 'none',
  whiteSpace: 'nowrap',
  padding: '0 0.2em',
  '@media (prefers-color-scheme: dark)': {
    color: disabled ? '#888' : '#ddd',
  },
  '@media (prefers-color-scheme: light)': {
    color: disabled ? '#888' : '#222',
  },
  [`&:hover, &:focus${expanded ? ', &' : ''}`]: disabled ? {} : {
    '@media (prefers-color-scheme: dark)': {
      color: '#eee',
      backgroundColor: '#fff2',
    },
    '@media (prefers-color-scheme: light)': {
      color: '#111',
      backgroundColor: '#0002',
    },
  },
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',

  '& > label': {
    flexGrow: 0,
    flexShrink: 0,

    '&.label': {
      flexGrow: 1,
    },

    '&.checked': {
      margin: '0 0.4em',
      width: '1.2em',
      textAlign: 'center',
    },

    '&.accelerator': {
      marginInlineStart: '5em',
    },

    '&.expand': {
      margin: '0 0.4em',
      width: '1.2em',
      textAlign: 'center',
    },
  },
}));

const MenuGroupSplitter = styled.hr({
  margin: '0.4em 0.86em',
  borderInline: 'none',
  borderBlockStart: 'none',
  borderBlockEnd: '1px solid #888',
});

const MenuGroup: React.FC<
  Pick<MultipleMenuItemProps, 'subMenu'> & {
    pos: 'right' | 'bottom';
    deep: boolean;
    path: string;
  }
> = React.memo(
  function MenuNode ({ subMenu, pos, deep, path }) {
    const { t } = useTranslation();
    const [finished, setFinished] = React.useState(false);
    const [expanded, setExpanded] = React.useState(-1);

    React.useEffect(() => {
      if (expanded) {
        const handleClick = () => {
          setExpanded(-1);
        };

        document.addEventListener('click', handleClick);

        return () => {
          document.removeEventListener('click', handleClick);
        };
      }

      return;
    }, [expanded, setExpanded]);

    return (
      <MenuGroupPlacer pos={pos} >
        <MenuGroupElement deep={deep} >
          {
            subMenu.map((item, i) => typeof item === 'string' ? (
              <MenuGroupSplitter
                key={i}
              />
            ) : (() => {
              const label = `${path}.${item.label}`;
              const disabled = (item as MenuItemProps).disabled?.() ?? false;

              return (
                <MenuNodeElement
                  role={
                    (item as MenuItemProps).checked
                      ? 'checkbox'
                      : (item as MenuItemProps).callback
                        ? 'button'
                        : 'menu'
                  }
                  aria-checked={
                    (item as MenuItemProps).checked?.() ?? undefined
                  }
                  aria-disabled={
                    (item as MenuItemProps).callback ? disabled : undefined
                  }
                  disabled={disabled}
                  key={i}
                  tabIndex={disabled ? undefined : 0}
                  expanded={expanded === i}
                  onMouseOver={
                    e => {
                      if ((item as MultipleMenuItemProps).subMenu) {
                        setExpanded(i);
                        
                        return e.stopPropagation();
                      }
                    }
                  }
                  onMouseOut={
                    e => {
                      if ((item as MultipleMenuItemProps).subMenu) {
                        setExpanded(-1);
                        
                        return e.stopPropagation();
                      }
                    }
                  }
                  onClick={
                    () => {
                      if (finished || disabled) {
                        return;
                      }

                      if ((item as MultipleMenuItemProps).subMenu) {
                        return;
                      }

                      setFinished(true);
                      (item as MenuItemProps).callback();
                    }
                  }
                  onKeyPress={
                    e => {
                      if (e.key === 'Enter') {
                        if ((item as MultipleMenuItemProps).subMenu) {
                          setExpanded(i);
                          
                          return e.stopPropagation();
                        } else {
                          e.currentTarget.click();
                        }
                      }
                    }
                  }
                >
                  {
                    expanded === i && (
                      <MenuGroup
                        path="label"
                        pos="right"
                        subMenu={(item as MultipleMenuItemProps).subMenu ?? []}
                        deep={true}
                      />
                    )
                  }
                  <label className="checked" >
                    {(item as MenuItemProps).checked?.() ? '\u2713' : ''}
                  </label>
                  <label className="label" >
                    {
                      item.label.match(/^\$/)
                        ? item.label.replace(/^\$/, '')
                        : (
                          (item as MultipleMenuItemProps).subMenu
                            ? t(`${label}._`)
                            : t(label)
                        )
                    }
                  </label>
                  <label className="accelerator" >
                    {(item as MenuItemProps).accelerator ?? ''}
                  </label>
                  <label className="expand" >
                    {(item as MultipleMenuItemProps).subMenu?.length ? '\u276f' : ''}
                  </label>
                </MenuNodeElement>
              );
            })())
          }
        </MenuGroupElement>
      </MenuGroupPlacer>
    );
  }
);

/**
 * 工具栏菜单.
 */
const MenuItem: React.FC<MenuItemProps | MultipleMenuItemProps> = React.memo(
  function MenuItem (props) {
    const { t } = useTranslation();
    const [expanded, setExpanded] = React.useState(false);
    const ref = React.useRef<HTMLDivElement>();

    React.useEffect(() => {
      if (expanded) {
        const handleClick = (e: MouseEvent) => {
          let target = e.target;

          while (target && target !== document) {
            if (target === ref.current) {
              return;
            }

            target = (target as HTMLElement).parentElement;
          }

          setExpanded(false);
        };

        document.addEventListener('click', handleClick);

        return () => {
          document.removeEventListener('click', handleClick);
        };
      }

      return;
    }, [expanded, setExpanded, ref.current]);

    const disabled = (props as MenuItemProps).disabled?.() ?? false;

    const handleClick = React.useCallback((e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      if (disabled) {
        return;
      }

      if ((props as MultipleMenuItemProps).subMenu?.length) {
        setExpanded(!expanded);
      } else {
        e.currentTarget.blur();
      }
    }, [(props as MenuItemProps).callback, expanded, setExpanded, disabled]);

    const handleKeyPress = React.useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
      if (disabled) {
        return;
      }

      if (e.key === 'Enter') {
        e.currentTarget.click();
      }
    }, [disabled]);

    const label = `menu.${props.label}`;

    if ((props as MenuItemProps).callback) {
      return (
        <MenuItemElement
          role="menuitem"
          tabIndex={disabled ? undefined : 0}
          aria-disabled={disabled}
          onClick={handleClick}
          onKeyPress={handleKeyPress}
          expanded={false}
          disabled={disabled}
          ref={e => e && [ref.current = e]}
        >
          <label>
            {
              props.label.match(/^\$/)
                ? props.label.replace(/^\$/, '')
                : t(label)
            }
          </label>
        </MenuItemElement>
      );
    }

    return (
      <MenuItemElement
        role="menu"
        tabIndex={0}
        onClick={handleClick}
        onKeyPress={handleKeyPress}
        expanded={expanded}
        disabled={false}
        ref={e => e && [ref.current = e]}
      >
        {
          expanded && (
            <MenuGroup
              path={label}
              pos="bottom"
              subMenu={(props as MultipleMenuItemProps).subMenu ?? []}
              deep={false}
            />
          )
        }
        <label>
          {
            props.label.match(/^\$/)
              ? props.label.replace(/^\$/, '')
              : t(`${label}._`)
          }
        </label>
      </MenuItemElement>
    );
  }
);


export default MenuItem;

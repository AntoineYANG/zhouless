/*
 * @Author: Kanata You 
 * @Date: 2022-04-22 16:06:37 
 * @Last Modified by: Kanata You
 * @Last Modified time: 2022-04-22 16:09:08
 */

import React from 'react';
import styled from 'styled-components';


const Thinner = styled.span({
  display: 'inline-block',
  fontSize: '80%',
  transform: 'scaleY(1.22) translateY(-0.08em)',
  lineHeight: '1em',
  verticalAlign: 'baseline',
  letterSpacing: '-0.2em',
  marginInlineEnd: '0.2em',
});

export interface ThinnerKatakanaProps {
  children: string;
  /** 即使只含有片假名，也缩小显示宽度，默认为 false */
  force?: boolean;
}

/**
 * 当文字内容包含片假名和其他时，缩小片假名部分的显示宽度.
 */
const ThinnerKatakana: React.FC<ThinnerKatakanaProps> = React.memo(function ThinnerKatakana ({
  children,
  force = false,
}) {
  const groups = React.useMemo(() => {
    const res: { text: string; isKatakana: boolean }[] = [];
    let tmp = children;

    while (tmp.length) {
      if (/^[\u30a0-\u30ff]+/.test(tmp)) {
        // 以片假名开头
        const piece = /^[\u30a0-\u30ff]+/.exec(tmp)?.[0] ?? '';
        tmp = tmp.substr(piece.length);
        res.push({
          text: piece,
          isKatakana: true
        });
      } else {
        const piece = /^[^\u30a0-\u30ff]+/.exec(tmp)?.[0] ?? '';
        tmp = tmp.substr(piece.length);
        res.push({
          text: piece,
          isKatakana: false
        });
      }
    }

    return res;
  }, [children]);

  const shouldTransform = React.useMemo(() => {
    return force || groups.reduce<[boolean, boolean]>(
      (res, d) => {
        return [res[0] || d.isKatakana, res[1] || !d.isKatakana];
      }, [false, false]
    ).every(Boolean);
  }, [groups, force]);

  return (
    <React.Fragment>
      {
        groups.map((d, i) => (
          d.isKatakana && shouldTransform ? (
            <Thinner key={i} >
              {d.text}
            </Thinner>
          ) : (
            <React.Fragment key={i} >
              {d.text}
            </React.Fragment>
          )
        ))
      }
    </React.Fragment>
  );
});


export default ThinnerKatakana;

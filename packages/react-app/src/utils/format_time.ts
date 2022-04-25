/*
 * @Author: Kanata You 
 * @Date: 2022-04-22 21:49:45 
 * @Last Modified by: Kanata You
 * @Last Modified time: 2022-04-25 19:41:38
 */


const formatTime = (t: number, msFixed: number = 3): string => {
  if (Number.isNaN(t)) {
    return '--:--:--.---';
  }

  const h = Math.floor(t / 3600);
  const m = Math.floor((t - h * 3600) / 60);
  const s = Math.floor(t % 60);
  const ms = t - Math.floor(t);

  return `${
    `${h}`.padStart(2, '0')
  }:${
    `${m}`.padStart(2, '0')
  }:${
    `${s}`.padStart(2, '0')
  }.${ms.toFixed(msFixed).replace(/^\d\./, '')}`;
};

export const splitTime = (t: number): [number, number, number, number] => {
  if (Number.isNaN(t)) {
    return [NaN, NaN, NaN, NaN];
  }

  const h = Math.floor(t / 3600);
  const m = Math.floor((t - h * 3600) / 60);
  const s = Math.floor(t % 60);
  const ms = t - Math.floor(t);

  return [h, m, s, Math.floor(ms * 1000)];
};

export const resolveTime = ([
  h, m, s, ms
]: [number, number, number, number]): number => {
  if ([h, m, s, ms].some(e => Number.isNaN(e))) {
    return NaN;
  }

  return h * 3600 + m * 60 + s + (ms + 0.99999) / 1000;
};

export default formatTime;

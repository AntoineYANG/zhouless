/*
 * @Author: Kanata You 
 * @Date: 2022-04-22 21:49:45 
 * @Last Modified by: Kanata You
 * @Last Modified time: 2022-04-22 23:04:29
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

export default formatTime;

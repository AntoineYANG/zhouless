/*
 * @Author: Kanata You 
 * @Date: 2022-04-13 20:45:44 
 * @Last Modified by: Kanata You
 * @Last Modified time: 2022-04-13 20:49:54
 */

/**
 * 当异步任务未完成时，阻塞下一次调用.
 */
const asyncEvent = <F extends (...args: any) => Promise<any>>(
  foo: F
): (...args: Parameters<F>) => ReturnType<F> | Promise<false> => {
  let active = true;

  const held = async (...args: Parameters<F>) => {
    if (!active) {
      return false;
    }

    active = false;

    const res = await foo(...args) as ReturnType<F>;

    active = true;

    return res;
  };

  return held;
};


export default asyncEvent;

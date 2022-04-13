/*
 * @Author: Kanata You 
 * @Date: 2022-04-13 18:03:52 
 * @Last Modified by: Kanata You
 * @Last Modified time: 2022-04-13 18:10:50
 */

const debounce = <F extends (...args: any) => any>(
  foo: F, span: number = 100
): (...args: Parameters<F>) => (ReturnType<F> | false) => {
  let active = true;

  const debounced = (...args: Parameters<F>) => {
    if (!active) {
      return false;
    }

    active = false;

    setTimeout(() => {
      active = true;
    }, span);

    return foo(...args);
  };

  return debounced;
};


export default debounce;

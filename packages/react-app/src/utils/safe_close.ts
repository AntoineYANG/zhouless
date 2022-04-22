/*
 * @Author: Kanata You 
 * @Date: 2022-04-21 03:08:23 
 * @Last Modified by: Kanata You
 * @Last Modified time: 2022-04-21 23:43:35
 */

const block = async (): Promise<boolean> => {
  // TODO:
  
  return true;
};

const safeClose = async (): Promise<boolean> => {
  return await block() && await (async () => {
    await electron.close();

    return true;
  })();
};

export const safeReload = async (): Promise<boolean> => {
  return await block() && await (async () => {
    await electron.reload();
    
    return true;
  })();
};

export const safeWait = async (): Promise<boolean> => {
  return block();
};


export default safeClose;

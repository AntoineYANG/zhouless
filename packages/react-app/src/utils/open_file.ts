/*
 * @Author: Kanata You 
 * @Date: 2022-04-13 20:10:26 
 * @Last Modified by: Kanata You
 * @Last Modified time: 2022-04-13 21:41:20
 */

/**
 * 调起文件对话框，导入文件.
 */
const openFile = async (accept: string[]): Promise<File | null> => {
  const element = document.createElement('input');
  element.type = 'file';
  element.accept = accept.join(',');
  element.multiple = false;

  element.style.display = 'none';
  element.ariaHidden = 'true';

  const p = await new Promise<{
    file: File | null;
    handler: () => void;
  }>(resolve => {
    document.body.appendChild(element);

    const onDialogClose = () => {
      resolve({
        file: element.files?.[0] ?? null,
        handler: onDialogClose
      });

      element.remove();
    };

    element.onchange = onDialogClose;
    
    element.click();

    window.addEventListener('click', onDialogClose, {
      capture: true
    });
  });

  window.removeEventListener('click', p.handler);

  return p.file;
};

/**
 * 调起文件对话框，导入多个文件.
 */
export const openFiles = async (accept: string[]): Promise<File[]> => {
  const element = document.createElement('input');
  element.type = 'file';
  element.accept = accept.join(',');
  element.multiple = true;

  element.style.display = 'none';
  element.ariaHidden = 'true';

  const p = await new Promise<{
    files: File[];
    handler: () => void;
  }>(resolve => {
    document.body.appendChild(element);

    const onDialogClose = () => {
      const files: File[] = [];

      for (let i = 0; i < (element.files ?? []).length; i += 1) {
        files.push(element.files?.[i]!);
      }

      resolve({
        files,
        handler: onDialogClose
      });

      element.remove();
    };

    element.onchange = onDialogClose;
    
    element.click();

    window.addEventListener('click', onDialogClose, {
      capture: true
    });
  });

  window.removeEventListener('click', p.handler);

  return p.files;
};


export default openFile;

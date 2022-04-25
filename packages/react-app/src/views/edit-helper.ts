/*
 * @Author: Kanata You 
 * @Date: 2022-04-22 21:02:44 
 * @Last Modified by: Kanata You
 * @Last Modified time: 2022-04-25 16:51:12
 */

import type { SubtitleItem, SubtitleItemOption } from './context';
import type EditorContext from './context';


type TravelableOperation = {
  forward: () => void;
  backward: () => void;
};

export default class EditHelper {
  
  context: EditorContext;

  private get filename(): string {
    return this.context.workspace?.filename ?? '(empty)';
  }

  private get duration(): number {
    return this.context.workspace?.origin.duration ?? NaN;
  }
  
  private options: SubtitleItemOption[];
  private data: SubtitleItem[];
  private tempItem: SubtitleItem | null = null;

  private subscribers: ((helper: EditHelper) => void)[] = [];

  /** 可撤销的操作次数 */
  private _operationMemorySize: number = 40;

  set operationMemorySize(size: number) {
    if (size !== Math.floor(size) || size < 2 || size > 256) {
      return;
    }

    this._operationMemorySize = size;

    if (this.operations.length > this.operationMemorySize) {
      this.operations.splice(0, this.operations.length - this.operationMemorySize);
    }

    this.operationCursor = this.operations.length - 1;
  }

  get operationMemorySize() {
    return this._operationMemorySize;
  }
  
  constructor(
    context: EditorContext,
    options: SubtitleItemOption[] = [],
    data: SubtitleItem[] = [],
  ) {
    this.context = context;
    this.options = options;
    this.data = data;
  }

  getSubtitles() {
    return [...this.data];
  }

  getPreview() {
    return this.tempItem;
  }

  getOptions() {
    return [...this.options];
  }

  private dirty = false;

  fireUpdate(): void {
    if (this.dirty) {
      return;
    }

    this.dirty = true;

    requestAnimationFrame(() => {
      this.subscribers.forEach(cb => cb(this));
      this.dirty = false;
      this.undoRedoDirty = false;
    });
  }

  subscribe(cb: (helper: EditHelper) => void): void {
    this.subscribers.push(cb);
  }

  unsubscribe(cb: (helper: EditHelper) => void): void {
    this.subscribers = this.subscribers.filter(e => e !== cb);
  }

  willAppendItem(beginTime: number, endTime: number): void {
    this.tempItem = {
      beginTime,
      endTime,
      text: '',
      option: this.data[this.data.length - 1]?.option ?? 0
    };

    this.fireUpdate();
  }

  clearWillAppendItem(): void {
    this.tempItem = null;

    this.fireUpdate();
  }

  appendItem(beginTime: number, endTime: number): void {
    this.pushOperation({
      forward: () => {
        this.data.push({
          beginTime,
          endTime,
          text: '',
          option: this.data[this.data.length - 1]?.option ?? 0
        });
      },
      backward: () => {
        this.data.splice(this.data.length - 1);
      }
    });

    this.fireUpdate();
  }

  private readonly operations: TravelableOperation[] = [];
  private operationCursor: number = -1;

  private pushOperation(operation: TravelableOperation): void {
    this.operations.push(operation);

    if (this.operations.length > this.operationMemorySize) {
      this.operations.splice(0, this.operations.length - this.operationMemorySize);
    }

    this.operationCursor = this.operations.length - 1;
    this.operations[this.operationCursor]!.forward();
    this.fireUpdate();
  }

  // 用这个标记防止撤销/重做时触发文本框 onChange 事件，
  private _autoSetFlag = false;
  get isAutoSet(): boolean {
    const res = this._autoSetFlag;
    this._autoSetFlag = false;
    
    return res;
  }

  // 这个标记用于避免撤销/重做连续触发.
  private undoRedoDirty = false;

  /**
   * 更改一条字幕记录的文字，可撤销.
   */
  writeText(idx: number, value: string): void {
    if (!this.data[idx]) {
      console.error(
        `EditHelper.writeText() received idx=${idx} is larger than length (${this.data.length})`
      );

      return;
    }

    const originValue = this.data[idx]!.text;

    if (originValue === value) {
      return;
    }

    this.pushOperation({
      forward: () => {
        if (!this.data[idx]) {
          return;
        }

        // console.log('forward', `"${originValue}" -> "${value}"`);
        this.data[idx]!.text = value;
      },
      backward: () => {
        if (!this.data[idx]) {
          return;
        }

        // console.log('backward', `"${value}" -> "${originValue}"`);
        this.data[idx]!.text = originValue;
      }
    });
  }

  /**
   * 更改一条字幕记录的时间范围，可撤销.
   */
  writeDuration(idx: number, value: Pick<SubtitleItem, 'beginTime' | 'endTime'>): void {
    if (!this.data[idx]) {
      console.error(
        `EditHelper.writeText() received idx=${idx} is larger than length (${this.data.length})`
      );

      return;
    }

    const originValue: typeof value = {
      beginTime: this.data[idx]!.beginTime,
      endTime: this.data[idx]!.endTime
    };

    if (originValue.beginTime === value.beginTime && originValue.endTime === value.endTime) {
      return;
    }

    this.pushOperation({
      forward: () => {
        if (!this.data[idx]) {
          return;
        }

        // console.log('forward', `"${originValue}" -> "${value}"`);
        this.data[idx]!.beginTime = value.beginTime;
        this.data[idx]!.endTime = value.endTime;
      },
      backward: () => {
        if (!this.data[idx]) {
          return;
        }

        // console.log('backward', `"${value}" -> "${originValue}"`);
        this.data[idx]!.beginTime = originValue.beginTime;
        this.data[idx]!.endTime = originValue.endTime;
      }
    });
  }

  canUndo(): boolean {
    return this.operationCursor !== -1;
  }

  /**
   * 撤销一步.
   */
  undo(): void {
    if (!this.canUndo() || this.undoRedoDirty) {
      return;
    }

    this.operations[this.operationCursor]!.backward();
    this.operationCursor -= 1;
    this._autoSetFlag = true;
    this.undoRedoDirty = true;
    this.fireUpdate();
  }

  canRedo(): boolean {
    return this.operationCursor < this.operations.length - 1;
  }

  /**
   * 重做一步.
   */
  redo(): void {
    if (!this.canRedo() || this.undoRedoDirty) {
      return;
    }

    this.operationCursor += 1;
    this.operations[this.operationCursor]!.forward();
    this._autoSetFlag = true;
    this.undoRedoDirty = true;
    this.fireUpdate();
  }

}

/*
 * @Author: Kanata You 
 * @Date: 2022-04-22 21:02:44 
 * @Last Modified by: Kanata You
 * @Last Modified time: 2022-04-22 23:17:40
 */

import type { SubtitleItem, SubtitleItemOption } from './context';


export default class EditHelper {

  readonly filename: string;
  readonly duration: number;
  private options: SubtitleItemOption[];
  private data: SubtitleItem[];
  private tempItem: SubtitleItem | null = null;

  private subscribers: ((helper: EditHelper) => void)[] = [];
  
  constructor(
    filename: string,
    duration: number,
    options: SubtitleItemOption[] = [],
    data: SubtitleItem[] = []
  ) {
    this.filename = filename;
    this.duration = duration;
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
    this.data.push({
      beginTime,
      endTime,
      text: '',
      option: this.data[this.data.length - 1]?.option ?? 0
    });

    this.fireUpdate();
  }

}

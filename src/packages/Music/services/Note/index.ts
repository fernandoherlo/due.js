import type { INote } from '~/src/types';

export default class Note implements INote {
  value: string | Array<string> | any;
  duration: number | Array<number> | any;
  interval: number | Array<number> | any;

  constructor (data: any, defaults: boolean = false) {
    this.value = data.value;
    this.duration = data.value2 || (defaults ? 0.25 : undefined);
    this.interval = data.value3 || (defaults ? 2 : undefined);
  }
}

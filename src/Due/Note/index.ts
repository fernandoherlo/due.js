import { INote } from '../../vite-env';

export default class Note implements INote {
  value: string;
  duration: number;
  interval: number;

  constructor (data: any) {
    this.value = data.value;
    this.duration = data.duration || 0.25;
    this.interval = data.interval || 2;
  }
}

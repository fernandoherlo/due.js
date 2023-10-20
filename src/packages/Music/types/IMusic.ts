import { IApp } from '~/src/vite-env';

export interface IMusic {
  _app: IApp;
  _debug: boolean;
  _instructions: any;

  start: () => Promise<void>;
  toggle: () => Promise<void>;
  add: (instructions: Array<any>) => Promise<void>;
  update: (instructions: Array<any>) => void;
  delete: (instructions: Array<any>) => Promise<void>;
}

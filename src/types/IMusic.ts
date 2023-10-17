import { IApp } from '~/src/vite-env';

export interface IMusic {
  _app: IApp;
  _debug: boolean;
  _instructions: any;
  _lastInstructions: any;

  start: () => Promise<void>;
  toggle: () => Promise<void>;
  process: (instructions: Array<any>) => Promise<void>;
  _add: (instructions: Array<any>) => Promise<void>;
  _update: (instructions: Array<any>) => void;
  _delete: (instructions: Array<any>) => Promise<void>;
}

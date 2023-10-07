import { IApp, IProxy } from '~/src/vite-env';

export interface IDue extends IProxy {
  _app: IApp;
  _debug: boolean;
  _instructions: any;

  add: (instructions: Array<any>) => Promise<void>;
  update: (instructions: Array<any>) => void;
  delete: (instructions: Array<any>) => Promise<void>;
}

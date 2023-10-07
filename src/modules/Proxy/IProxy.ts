import { IApp } from '~/src/vite-env';

export interface IProxy {
  _app: IApp;
  _debug: boolean;

  add: (instructions: Array<any>) => void;
  update: (instructions: Array<any>) => void;
  delete: (instructions: Array<any>) => void;
  linkToApp: () => void;
}

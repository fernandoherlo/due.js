import { IApp } from '~/src/vite-env';

export interface IStore {
  _app: IApp;
  state: any;
}

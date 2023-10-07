import { IApp } from '~/src/vite-env';

export interface ILogger {
  _app: IApp;
  _debug: boolean;

  log: (messages: any | any[] | string) => void;
  error: (messages: any | any[] | string) => void;
}

import { IApp, ILogger } from '~/src/vite-env';

export default class Logger implements ILogger {
  private _app: IApp;
  private _debug: boolean;

  constructor (app: IApp) {
    this._app = app;
    this._debug = this._app.$debug;
  }

  log (...messages: any | any[] | string) {
    if (this._debug) {
      console.log(...messages);
    }
  }

  error (...messages: any | any[] | string) {
    if (this._debug) {
      console.error(...messages);
    }
  }
}

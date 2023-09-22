import { IApp, ILogger } from '../../vite-env';

export default class Logger implements ILogger {
  _app: IApp;
  _debug: boolean;

  constructor (app: IApp) {
    this._app = app;
    this._debug = this._app.$debug;
  }

  log (...messages: any[]) {
    if (this._debug) {
      console.log(...messages);
    }
  }

  error (...messages: any[]) {
    if (this._debug) {
      console.error(...messages);
    }
  }
}

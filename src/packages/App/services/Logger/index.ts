import { IApp, ILogger } from '~/src/vite-env';

export default class Logger implements ILogger {
  private _app: IApp;
  private _logEnabled: boolean;

  constructor (app: IApp) {
    this._app = app;
    this._logEnabled = this._app.$logEnabled;
  }

  log (...messages: any | any[] | string) {
    const bold: string = 'font-weight: bold; font-size: 1.2em;';
    const normal: string = 'font-weight: normal; font-size: 1em;';
    const italic: string = 'font-style: italic; font-size: 0.8em;';

    if (this._logEnabled) {
      console.log(...messages, bold, normal, italic);
    }
  }

  error (...messages: any | any[] | string) {
    if (this._logEnabled) {
      console.error(...messages);
    }
  }
}

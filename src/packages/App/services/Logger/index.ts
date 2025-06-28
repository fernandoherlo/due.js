import type { IApp, ILogger } from '~/src/types';

export default class Logger implements ILogger {
  private app: IApp;

  constructor (app: IApp) {
    this.app = app;
  }

  log (...messages: any | any[] | string) {
    const bold: string = 'font-weight: bold; font-size: 1.2em;';
    const normal: string = 'font-weight: normal; font-size: 1em;';
    const italic: string = 'font-style: italic; font-size: 0.8em;';

    if (this.app.__logEnabled) {
      console.log(...messages, bold, normal, italic);
    }
  }

  error (...messages: any | any[] | string) {
    if (this.app.__logEnabled) {
      console.error(...messages);
    }
  }
}

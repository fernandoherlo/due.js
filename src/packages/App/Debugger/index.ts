import { stringify } from 'flatted';
import { IDebugger, IApp } from '~/src/vite-env';

export default class Debugger implements IDebugger {
  _app: IApp;
  _debug: boolean;
  _htmlId: string;

  constructor (app: IApp, htmlId: string) {
    this._app = app;
    this._debug = this._app.$debug;
    this._htmlId = htmlId;

    const container = window || {};
    if (this._debug && container) {
      container.App = this._app;
    }
  }

  add (title: string, text: any) {
    if (!title || !text) {
      return;
    }

    if (this._debug) {
      const debuggerElement: HTMLDivElement | null = document.getElementById(this._htmlId) as HTMLDivElement;
      debuggerElement.innerHTML = `${this._getDate()} | ${title} | ${stringify(text, null, 2)}<br><br>---<br><br>` + debuggerElement.innerHTML;
    }
  }

  _getDate () {
    return new Date();
  }
}

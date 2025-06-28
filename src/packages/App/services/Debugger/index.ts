import type { IDebugger, IApp } from '~/src/types';
import { stringify } from 'flatted';

export default class Debugger implements IDebugger {
  private app: IApp;
  private htmlId: string;

  constructor (app: IApp) {
    this.app = app;
    this.htmlId = 'debugger';

    const container = window || {};
    if (this.app.__debugEnabled && container) {
      container.App = this.app;
    }
  }

  add (title: string, text: any) {
    if (!title || !text) {
      return;
    }

    if (this.app.__debugEnabled) {
      const debuggerElement: HTMLDivElement | null = document.getElementById(this.htmlId) as HTMLDivElement;
      debuggerElement.innerHTML = `${this._getDate()} | ${title} | ${stringify(text, null, 2)}<br><br>---<br><br>` + debuggerElement.innerHTML;
    }
  }

  private _getDate () {
    return new Date();
  }
}

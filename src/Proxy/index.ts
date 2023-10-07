import { stringify } from 'flatted';
import { IApp, IProxy } from '../vite-env';

export default class Proxy implements IProxy {
  _app: IApp;
  _debug: boolean;

  constructor (app: IApp) {
    this._app = app;
    this._debug = this._app.$debug;
  }

  linkToApp () {
    this._app.$proxy = this;
  }

  add (instructions: Array<any> = []): void {
    if (instructions.length) {
      this._app.$debugger.add('ADD', stringify(instructions, null, 2));
    }
  }

  update (instructions: Array<any> = []): void {
    if (instructions.length) {
      this._app.$debugger.add('UPDATE', stringify(instructions, null, 2));
    }
  }

  delete (instructions: Array<any> = []): void {
    if (instructions.length) {
      this._app.$debugger.add('DELETE', stringify(instructions, null, 2));
    }
  }
}

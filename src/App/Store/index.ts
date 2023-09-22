import { IApp, IStore } from '../../vite-env';

export default class Store implements IStore {
  _app: IApp;
  state: any;

  constructor (app: IApp) {
    this._app = app;

    this.state = {};
  }
}

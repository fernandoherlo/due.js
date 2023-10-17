import { IApp, IErrorHandler } from '~/src/vite-env';

export default class Handler implements IErrorHandler {
  _app: IApp;

  constructor (app: IApp) {
    this._app = app;

    const container = window || {};
    container.onerror = (...args) => {
      this._catchError(args);
      return true;
    };
  }

  _catchError (args: any[]) {
    this._app.$logger.error(args);
  }
}

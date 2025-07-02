import type { IApp, IErrorHandler } from '~/src/types';

export default class Handler implements IErrorHandler {
  private app: IApp;

  constructor (app: IApp) {
    this.app = app;

    const container = window || {};
    container.onerror = (...args) => {
      this.catchError(args);
      return true;
    };
  }

  private catchError (args: unknown[]) {
    this.app.$logger.error(args);
  }
}

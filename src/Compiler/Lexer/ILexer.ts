import { IApp, IParser } from '../../vite-env';

export interface ILexer {
  _app: IApp;
  _parser: IParser;

  exec: (code: string) => Array<object>;
}

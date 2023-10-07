import { IApp, IInstruction, IParser } from '~/src/vite-env';

export interface ILexer {
  _app: IApp;
  _parser: IParser;

  exec: (code: string) => Array<IInstruction>;
}

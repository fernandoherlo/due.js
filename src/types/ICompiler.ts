import { IApp, ILexer, IInterpreter } from '~/src/vite-env';

export interface ICompiler {
  _app: IApp;
  _lexer: ILexer;
  _interpreter: IInterpreter;

  exec: (code: string) => any;
}

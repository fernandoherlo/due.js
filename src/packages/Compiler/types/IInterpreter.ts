import { IApp, IInstruction } from '~/src/vite-env';

export interface IInterpreter {
  _app: IApp;

  exec: (lexical: Array<IInstruction>) => any;
}

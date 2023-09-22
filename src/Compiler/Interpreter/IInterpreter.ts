import { IApp, IInstruction } from '../../vite-env';

export interface IInterpreter {
  _app: IApp;

  exec: (lexical: Array<IInstruction>) => any;
}

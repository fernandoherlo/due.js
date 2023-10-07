import { IApp, ILexer, IInterpreter, ICompiler, IInstruction } from '~/src/vite-env';

export default class Compiler implements ICompiler {
  _app: IApp;
  _lexer: ILexer;
  _interpreter: IInterpreter;

  constructor (app: IApp, lexer: ILexer, interpreter: IInterpreter) {
    this._app = app;
    this._lexer = lexer;
    this._interpreter = interpreter;
  }

  exec (code: string) {
    this._app.$logger.log(code);

    const lexical: Array<IInstruction> = this._lexer.exec(code);
    return this._interpreter.exec(lexical);
  }
}

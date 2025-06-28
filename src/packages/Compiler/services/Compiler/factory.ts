import type { IApp, ICompiler, IInterpreter, ILexer, IParser } from '~/src/types';
import Parser from '../Parser';
import Lexer from '../Lexer';
import Interpreter from '../Interpreter';
import Compiler from './';

export default function CompilerFactory (app: IApp): ICompiler {
  const parser: IParser = new Parser(app);
  const lexer: ILexer = new Lexer(app, parser);
  const interpreter: IInterpreter = new Interpreter(app);

  return new Compiler(app, lexer, interpreter);
}

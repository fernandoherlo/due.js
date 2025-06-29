import type { IApp, ICompiler, IInterpreter, ILexer, IParser, IValueParser } from '~/src/types';
import Parser from '../Parser';
import ValueParser from '../Parser/value';
import Lexer from '../Lexer';
import Interpreter from '../Interpreter';
import Compiler from './';

export default function CompilerFactory (app: IApp): ICompiler {
  const valueParser:IValueParser = new ValueParser(app);
  const parser: IParser = new Parser(app, valueParser);
  const lexer: ILexer = new Lexer(app, parser);
  const interpreter: IInterpreter = new Interpreter(app);

  return new Compiler(app, lexer, interpreter);
}

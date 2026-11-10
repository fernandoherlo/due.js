import type { IApp, ICompiler, IInterpreter, ILexer, IParser, IValueFactory, IValueParser } from '~/src/types';
import Parser from '../Parser';
import ValueParser from '../Parser/value';
import SemanticAnalyzer from '../Parser/SemanticAnalyzer';
import Lexer from '../Lexer';
import Interpreter from '../Interpreter';
import Compiler from './';

export default function CompilerFactory (app: IApp, valueFactory: IValueFactory): ICompiler {
  const valueParser:IValueParser = new ValueParser(valueFactory);
  const parser: IParser = new Parser();
  const lexer: ILexer = new Lexer();
  const semanticAnalyzer = new SemanticAnalyzer(valueFactory, valueParser);
  const interpreter: IInterpreter = new Interpreter(app);

  return new Compiler(app, lexer, parser, semanticAnalyzer, interpreter);
}

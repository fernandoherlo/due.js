import { IApp, ICompiler } from '~/src/vite-env';
import Parser from '../Parser';
import Lexer from '../Lexer';
import Interpreter from '../Interpreter';
import Compiler from './';

export default function CompilerFactory (app: IApp): ICompiler {
  const parser = new Parser(app);
  const lexer = new Lexer(app, parser);
  const interpreter = new Interpreter(app);

  return new Compiler(app, lexer, interpreter);
}

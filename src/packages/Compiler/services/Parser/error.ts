import type { ISourceLocation } from '~/src/packages/Compiler/types/IAst';

export default class ParseError extends SyntaxError {
  constructor (readonly location: ISourceLocation, message: string) {
    super(`Line ${location.line}, column ${location.column}: ${message}.`);
  }
}

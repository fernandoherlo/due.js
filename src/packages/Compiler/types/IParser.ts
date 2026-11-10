import type { IAstProgram, ISourceLine } from './IAst';

export interface IParser {
  parse: (lines: ISourceLine[]) => IAstProgram;
}

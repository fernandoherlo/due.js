import type { ISourceLine } from './IAst';

export interface ILexer {
  exec: (code: string) => ISourceLine[];
}

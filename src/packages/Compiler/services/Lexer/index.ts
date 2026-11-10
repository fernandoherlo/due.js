import type { ILexer } from '~/src/types';
import type { ISourceLine } from '../../types/IAst';
import { CHARACTERS_INSTRUCTIONS } from '~/src/packages/Compiler/constants';

export default class Lexer implements ILexer {
  exec (code: string): ISourceLine[] {
    if (typeof code !== 'string') {
      throw Error('Code is not string.');
    }
    if (!code.trim()) {
      return [];
    }

    return code.split('\n').map((line, index) => ({
      code: line.split(CHARACTERS_INSTRUCTIONS.COMMENT)[0],
      line: index + 1
    }));
  }
}

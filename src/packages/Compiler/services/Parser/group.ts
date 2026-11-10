import { CHARACTERS_INSTRUCTIONS as CHAR } from '~/src/packages/Compiler/constants';
import ParseError from '~/src/packages/Compiler/services/Parser/error';

export interface IGroup {
  members: Array<{ text: string; column: number }>;
  suffix: string;
}

const OPENERS = [CHAR.INIT_MULTIPLE_VALUES, CHAR.INIT_VALUE_COMMAND];
const CLOSERS = [CHAR.END_MULTIPLE_VALUES, CHAR.END_VALUE_COMMAND];

// Un grupo es una linea que empieza por "[" : [pista1, pista2]:efecto(...)
export function splitGroup (source: string, line: number): IGroup | null {
  const start = source.length - source.trimStart().length;
  if (source[start] !== CHAR.INIT_MULTIPLE_VALUES) return null;

  const members: IGroup['members'] = [];
  let depth = 0;
  let memberStart = start + 1;
  let end = -1;
  const pushMember = (to: number) => {
    const text = source.slice(memberStart, to);
    if (!text.trim()) {
      throw new ParseError({ line, column: memberStart + 1 }, 'Empty track in group');
    }
    members.push({ text: text.trim(), column: memberStart + 1 + text.length - text.trimStart().length });
  };

  for (let index = start + 1; index < source.length && end < 0; index++) {
    const char = source[index];
    if (OPENERS.includes(char)) depth++;
    else if (CLOSERS.includes(char)) {
      if (depth === 0) {
        if (char !== CHAR.END_MULTIPLE_VALUES) throw new ParseError({ line, column: index + 1 }, 'Unexpected ) in group');
        pushMember(index);
        end = index;
      } else {
        depth--;
      }
    } else if (char === CHAR.SEPARATE_DIFERRENT_VALUES && depth === 0) {
      pushMember(index);
      memberStart = index + 1;
    }
  }

  if (end < 0) throw new ParseError({ line, column: start + 1 }, 'Group is missing ]');

  const suffix = source.slice(end + 1).trim();
  if (suffix && !suffix.startsWith(CHAR.CONCATENATE_COMMANDS) && !suffix.startsWith(CHAR.CONNECT)) {
    throw new ParseError({ line, column: end + 2 }, 'Expected : for group effects after ]');
  }
  return { members, suffix };
}

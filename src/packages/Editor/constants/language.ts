import { StreamLanguage } from '@codemirror/language';
import { CHARACTERS_INSTRUCTIONS, COMMANDS } from '~/src/packages/Compiler/constants';

const commandNames = new Set(Object.values(COMMANDS));

export const DueLanguage = StreamLanguage.define({
  name: 'duejs',
  token (stream) {
    if (stream.eatSpace()) return null;
    if (stream.match(CHARACTERS_INSTRUCTIONS.COMMENT)) {
      stream.skipToEnd();
      return 'comment';
    }
    if (stream.match(/^\$\$?\w*/)) return 'variableName';
    if (stream.match(/^#[\w-]*/)) return 'labelName';
    if (stream.match(/^[A-G](?:#|b)?-?\d+\b/)) return 'atom';
    if (stream.match(/^(?:\d+(?:\.\d+)?|\.\d+)/)) return 'number';
    if (stream.match(/^[a-z]+/)) {
      return commandNames.has(stream.current()) ? 'keyword' : null;
    }
    if (stream.match(/^(?:=>|[=,>|-])/)) return 'operator';
    if (stream.match(/^[;:@]/)) return 'separator';
    if (stream.match(/^[()[\]]/)) return 'bracket';
    stream.next();
    return null;
  },
  languageData: { commentTokens: { line: CHARACTERS_INSTRUCTIONS.COMMENT } }
});

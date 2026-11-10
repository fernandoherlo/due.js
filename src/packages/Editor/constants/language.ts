import { StreamLanguage } from '@codemirror/language';
import { CHARACTERS_INSTRUCTIONS, COMMANDS } from '~/src/packages/Compiler/constants';

const commandNames = new Set(Object.values(COMMANDS));

interface IDueState {
  started: boolean;
  group: boolean;
  depth: number;
}

const GROUP_TOKEN = 'string.special';

export const DueLanguage = StreamLanguage.define<IDueState>({
  name: 'duejs',
  startState: () => ({ started: false, group: false, depth: 0 }),
  copyState: state => ({ ...state }),
  token (stream, state) {
    if (stream.sol()) Object.assign(state, { started: false, group: false, depth: 0 });
    if (stream.eatSpace()) return null;
    const first = !state.started;
    state.started = true;
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
    if (stream.match(/^(?:=>|[=>|-])/)) return 'operator';
    if (stream.match(',')) return state.group && state.depth === 1 ? GROUP_TOKEN : 'operator';
    if (stream.match(/^[;:@]/)) return 'separator';
    if (stream.match(/^[([]/)) {
      state.depth++;
      if (first && stream.current() === '[') {
        state.group = true;
        return GROUP_TOKEN;
      }
      return 'bracket';
    }
    if (stream.match(/^[)\]]/)) {
      state.depth = Math.max(0, state.depth - 1);
      if (state.group && state.depth === 0) {
        state.group = false;
        return GROUP_TOKEN;
      }
      return 'bracket';
    }
    stream.next();
    return null;
  },
  languageData: { commentTokens: { line: CHARACTERS_INSTRUCTIONS.COMMENT } }
});

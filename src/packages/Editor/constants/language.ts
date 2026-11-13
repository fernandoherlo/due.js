import { StreamLanguage } from '@codemirror/language';
import { CHARACTERS_INSTRUCTIONS as CHAR, COMMANDS } from '~/src/packages/Compiler/constants';

const commandNames = new Set(Object.values(COMMANDS));

interface IDueState {
  started: boolean;
  group: boolean;
  depth: number;
}

const GROUP_TOKEN = 'string.special';
const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const variablePattern = new RegExp(`^(?:${escapeRegExp(COMMANDS.$)}){1,2}\\w*`);
const presetPattern = new RegExp(`^${escapeRegExp(CHAR.IDENTIFIER)}[\\w${escapeRegExp(CHAR.SEPARATE_MIN_MAX_VALUES)}]*`);
const notePattern = /^[A-G](?:#|b)?-?\d+\b/;
const numberPattern = /^(?:\d+(?:\.\d+)?|\.\d+)/;
const commandPattern = /^[a-z]+/;
const operatorPattern = new RegExp(`^(?:${[
  CHAR.CONNECT,
  CHAR.SEPARATE_PROGRESSION_VALUES,
  CHAR.SEPARATE_CHORD_VALUES,
  CHAR.SEPARATE_MIN_MAX_VALUES,
  '>', '=' // => is matched as a whole before individual operator characters.
].map(escapeRegExp).join('|')})`);
const separatorPattern = new RegExp(`^[${escapeRegExp(CHAR.SEPARATE_TYPE_VALUES + CHAR.CONCATENATE_COMMANDS + CHAR.BUS_PREFIX)}]`);
const openingPattern = new RegExp(`^[${escapeRegExp(CHAR.INIT_VALUE_COMMAND + CHAR.INIT_MULTIPLE_VALUES)}]`);
const closingPattern = new RegExp(`^[${escapeRegExp(CHAR.END_VALUE_COMMAND + CHAR.END_MULTIPLE_VALUES)}]`);

export const DueLanguage = StreamLanguage.define<IDueState>({
  name: 'duejs',
  startState: () => ({ started: false, group: false, depth: 0 }),
  copyState: state => ({ ...state }),
  token (stream, state) {
    if (stream.sol()) Object.assign(state, { started: false, group: false, depth: 0 });
    if (stream.eatSpace()) return null;
    const first = !state.started;
    state.started = true;
    if (stream.match(CHAR.COMMENT)) {
      stream.skipToEnd();
      return 'comment';
    }
    if (stream.match(new RegExp(`^${escapeRegExp(CHAR.BUS_PREFIX)}[a-zA-Z][a-zA-Z0-9_]*`))) return 'labelName';
    if (stream.match(variablePattern)) return 'variableName';
    if (stream.match(presetPattern)) return 'labelName';
    if (stream.match(notePattern)) return 'atom';
    if (stream.match(numberPattern)) return 'number';
    if (stream.match(commandPattern)) {
      return commandNames.has(stream.current()) ? 'keyword' : null;
    }
    if (stream.match(operatorPattern)) return 'operator';
    if (stream.match(CHAR.SEPARATE_DIFERRENT_VALUES)) return state.group && state.depth === 1 ? GROUP_TOKEN : 'operator';
    if (stream.match(separatorPattern)) return 'separator';
    if (stream.match(openingPattern)) {
      state.depth++;
      if (first && stream.current() === CHAR.INIT_MULTIPLE_VALUES) {
        state.group = true;
        return GROUP_TOKEN;
      }
      return 'bracket';
    }
    if (stream.match(closingPattern)) {
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
  languageData: { commentTokens: { line: CHAR.COMMENT } }
});

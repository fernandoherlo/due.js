import type { CompletionContext } from '@codemirror/autocomplete';
import {
  CHARACTERS_INSTRUCTIONS as CHAR,
  COMMANDS,
  COMMANDS_MAP,
  MODES,
  OPERATORS
} from '~/src/packages/Compiler/constants';
import { SAMPLER_MAP } from '~/src/packages/Music/constants/samplers';
import { SYNTH_PRESETS } from '~/src/packages/Music/constants/synths';

type CompletionKind = 'command' | 'effect' | 'mode' | 'preset' | 'synthPreset';

const excludedCommands = new Set([
  ...OPERATORS,
  ...MODES,
  COMMANDS.$,
  COMMANDS.$$,
  COMMANDS.con
]);

const commandOptions = Object.keys(COMMANDS_MAP)
  .filter(command => !excludedCommands.has(command))
  .map(label => ({ label, type: 'keyword' }));

const effectOptions = [COMMANDS.v, COMMANDS.r, COMMANDS.d, COMMANDS.cho]
  .map(label => ({ label, type: 'function' }));

const modeOptions = [...MODES, ...OPERATORS]
  .map(label => ({ label, type: 'function' }));

const presetOptions = Object.keys(SAMPLER_MAP)
  .map(label => ({ label, type: 'constant' }));

const synthPresetOptions = Object.keys(SYNTH_PRESETS)
  .map(label => ({ label, type: 'constant' }));

function isSamplerCommand (command: string): boolean {
  const commandName = command.trim();
  return commandName.startsWith(COMMANDS.sam) && /^\d*$/.test(commandName.slice(COMMANDS.sam.length));
}

function isSynthCommand (command: string): boolean {
  const commandName = command.trim();
  return commandName.startsWith(COMMANDS.n) && /^\d+$/.test(commandName.slice(COMMANDS.n.length));
}

function getCompletionKind (linePrefix: string): CompletionKind | null {
  let nesting = 0;
  let marker: CompletionKind | null = null;
  let markerIndex = -1;
  let segmentStart = 0;

  for (let index = 0; index < linePrefix.length; index++) {
    const character = linePrefix[index];

    if (linePrefix.startsWith(CHAR.COMMENT, index)) return null;
    if (nesting > 0) {
      if (character === CHAR.INIT_VALUE_COMMAND || character === CHAR.INIT_MULTIPLE_VALUES) nesting++;
      if (character === CHAR.END_VALUE_COMMAND || character === CHAR.END_MULTIPLE_VALUES) nesting--;
      continue;
    }
    if (character === CHAR.INIT_VALUE_COMMAND || character === CHAR.INIT_MULTIPLE_VALUES) {
      nesting++;
      continue;
    }
    if (linePrefix.startsWith(CHAR.CONNECT, index) || character === CHAR.EQUAL) return null;
    if (character === CHAR.IDENTIFIER) {
      const command = linePrefix.slice(segmentStart, index);
      if (isSamplerCommand(command)) marker = 'preset';
      else if (isSynthCommand(command)) marker = 'synthPreset';
      else marker = null;
      markerIndex = index + CHAR.IDENTIFIER.length;
      continue;
    }
    if (character !== CHAR.CONCATENATE_COMMANDS) continue;

    const isMode = linePrefix.startsWith(CHAR.MODE_COMMAND, index);
    marker = isMode ? 'mode' : 'effect';
    markerIndex = index + (isMode ? CHAR.MODE_COMMAND.length : CHAR.CONCATENATE_COMMANDS.length);
    segmentStart = markerIndex;
    if (isMode) index += CHAR.MODE_COMMAND.length - 1;
  }

  if (nesting > 0) return null;
  if (marker && /^\s*[a-z]*$/.test(linePrefix.slice(markerIndex))) return marker;
  if (/^\s*[a-z]*$/.test(linePrefix)) return 'command';
  return null;
}

export function dueCompletionSource (context: CompletionContext) {
  const line = context.state.doc.lineAt(context.pos);
  const linePrefix = context.state.sliceDoc(line.from, context.pos);
  const kind = getCompletionKind(linePrefix);
  if (!kind) return null;

  const word = context.matchBefore(/[a-z]*/);
  if (!word) return null;

  const options = {
    command: commandOptions,
    effect: effectOptions,
    mode: modeOptions,
    preset: presetOptions,
    synthPreset: synthPresetOptions
  }[kind];
  const isSynthLine = new RegExp(`^\\s*${COMMANDS.n}\\d+`).test(linePrefix);
  const contextualOptions = kind === 'mode' && !isSynthLine
    ? options.filter(option => option.label !== COMMANDS.detune)
    : options;

  return { from: word.from, options: contextualOptions, validFor: /^[a-z]*$/ };
}

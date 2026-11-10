export const COMMANDS: Record<string, string> = {
  p: 'p',
  n: 'n',
  seq: 'seq',
  sam: 'sam',
  reverse: 'reverse',
  misam: 'misam',
  s: 's',
  ai: 'ai',
  mo: 'mo',
  mi: 'mi',
  c: 'c',
  e: 'e',
  v: 'v',
  r: 'r',
  d: 'd',
  cho: 'cho',
  con: 'con',
  bpm: 'bpm',
  $: '$',
  $$: '$$'
} as const;

export const MODES: readonly string[] = [COMMANDS.reverse];

export const TEMPO = { default: 120, min: 20, max: 300, beatUnit: 'b' } as const;

export const COMMANDS_MAP: Record<typeof COMMANDS[keyof typeof COMMANDS], string> = {
  [COMMANDS.p]: 'piece',
  [COMMANDS.n]: 'notes',
  [COMMANDS.seq]: 'sequencer',
  [COMMANDS.sam]: 'sampler',
  [COMMANDS.reverse]: 'reverse_mode',
  [COMMANDS.misam]: 'midi_sampler',
  [COMMANDS.s]: 'synth',
  [COMMANDS.ai]: 'ai',
  [COMMANDS.mo]: 'midiOut',
  [COMMANDS.mi]: 'midiIn',
  [COMMANDS.c]: 'channel',
  [COMMANDS.e]: 'effect',
  [COMMANDS.v]: 'volumen',
  [COMMANDS.r]: 'reverb',
  [COMMANDS.d]: 'delay',
  [COMMANDS.cho]: 'chorus',
  [COMMANDS.con]: 'connect',
  [COMMANDS.$]: '0_variable_',
  [COMMANDS.$$]: '1_live_variable_'
};

export const TYPE_VALUE = {
  normal: 'normal',
  random: 'random',
  sequence: 'sequence',
  multi: 'multi'
} as const;

export const AST_KIND = {
  command: 'command',
  variable: 'variable',
  liveVariable: 'live-variable',
  connection: 'connection',
  scalar: 'scalar',
  reference: 'variable-reference',
  collection: 'collection',
  range: 'range'
} as const;

export const VALUE_OPERATOR = {
  random: TYPE_VALUE.random,
  sequence: TYPE_VALUE.sequence,
  chord: 'chord',
  single: 'single'
} as const;

export const CHARACTERS_INSTRUCTIONS = {
  CONNECT: '=>',
  CONCATENATE_COMMANDS: ':',
  MODE_COMMAND: '::',
  COMMENT: '//',
  EQUAL: '=',
  INIT_VALUE_COMMAND: '(',
  END_VALUE_COMMAND: ')',
  INIT_MULTIPLE_VALUES: '[',
  END_MULTIPLE_VALUES: ']',
  IDENTIFIER: '#',
  SEPARATE_TYPE_VALUES: ';',
  SEPARATE_DIFERRENT_VALUES: ',',
  SEPARATE_PROGRESSION_VALUES: '>',
  SEPARATE_CHORD_VALUES: '|',
  SEPARATE_MIN_MAX_VALUES: '-'
};

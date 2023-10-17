export const COMMANDS: any = {
  p: 'p',
  n: 'n',
  seq: 'seq',
  sam: 'sam',
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
  $: '$',
  $$: '$$'
};

export const COMMANDS_MAP: any = {
  [COMMANDS.p]: 'piece',
  [COMMANDS.n]: 'notes',
  [COMMANDS.seq]: 'sequencer',
  [COMMANDS.sam]: 'sampler',
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

export const TYPE_VALUE: any = {
  normal: 'normal',
  random: 'random',
  sequence: 'sequence',
  multi: 'multi'
};

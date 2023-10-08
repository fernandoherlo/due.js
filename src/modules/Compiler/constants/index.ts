export const COMMANDS: any = {
  p: 'p',
  n: 'n',
  seq: 'seq',
  sam: 'sam',
  s: 's',
  ai: 'ai',
  m: 'm',
  c: 'c',
  e: 'e',
  v: 'v',
  r: 'r',
  d: 'd',
  cho: 'cho',
  con: 'con'
};

export const COMMANDS_MAP: any = {
  [COMMANDS.p]: 'piece',
  [COMMANDS.n]: 'notes',
  [COMMANDS.seq]: 'sequencer',
  [COMMANDS.sam]: 'sampler',
  [COMMANDS.s]: 'synth',
  [COMMANDS.ai]: 'ai',
  [COMMANDS.m]: 'midi',
  [COMMANDS.c]: 'channel',
  [COMMANDS.e]: 'effect',
  [COMMANDS.v]: 'volumen',
  [COMMANDS.r]: 'reverb',
  [COMMANDS.d]: 'delay',
  [COMMANDS.cho]: 'chorus',
  [COMMANDS.con]: 'connect'
};

export const TYPE_VALUE: any = {
  normal: 'normal',
  random: 'random',
  sequence: 'sequence',
  multi: 'multi'
};

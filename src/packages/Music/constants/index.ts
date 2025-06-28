import type { IApp, IInstruction } from '~/src/types';
import { COMMANDS } from '~/src/packages/Compiler/constants';

import Synth from '../services/Instrument/Synth';
import Sampler from '../services/Instrument/Sampler';
import MidiSampler from '../services/Instrument/MidiSampler';
import MidiOut from '../services/Instrument/MidiOut';
import Magenta from '../services/Instrument/Magenta';
import Volumen from '../services/Effect/Volumen';
import Reverb from '../services/Effect/Reverb';
import Chorus from '../services/Effect/Chorus';
import Delay from '../services/Effect/Delay';
import VariableLive from '../services/VariableLive';
import MidiIn from '../services/MidiIn';

export const COMMANDS_ELEMENT_MAP: Record<typeof COMMANDS[keyof typeof COMMANDS], (instruction: IInstruction, app: IApp) => any> = {
  [COMMANDS.n]: (instruction: IInstruction, app: IApp) => new Synth(instruction, app),
  [COMMANDS.sam]: (instruction: IInstruction, app: IApp) => new Sampler(instruction, app),
  [COMMANDS.misam]: (instruction: IInstruction, app: IApp) => new MidiSampler(instruction, app),
  [COMMANDS.mo]: (instruction: IInstruction, app: IApp) => new MidiOut(instruction, app),
  [COMMANDS.mi]: (instruction: IInstruction, app: IApp) => new MidiIn(instruction, app),
  [COMMANDS.v]: (instruction: IInstruction, app: IApp) => new Volumen(instruction, app),
  [COMMANDS.r]: (instruction: IInstruction, app: IApp) => new Reverb(instruction, app),
  [COMMANDS.d]: (instruction: IInstruction, app: IApp) => new Delay(instruction, app),
  [COMMANDS.cho]: (instruction: IInstruction, app: IApp) => new Chorus(instruction, app),
  [COMMANDS.$$]: (instruction: IInstruction, app: IApp) => new VariableLive(instruction, app),
  [COMMANDS.ai]: (instruction: IInstruction, app: IApp) => new Magenta(instruction, app)
};

export const SAMPLER_MAP: Record<string, string> = {
  piano: 'vsco2-piano-mf',
  glock: 'vsco2-glock',
  bowls: 'kasper-singing-bowls',
  other: 'otherness',
  bass: 'vsco2-contrabass-susvib',
  violin: 'vsco2-violin-arcvib',
  violins: 'vsco2-violins-susvib',
  cor: 'sso-cor-anglais',
  flute: 'vsco2-flute-susvib',
  flute2: 'native-american-flute-susvib',
  cello: 'vsco2-cello-susvib-f',
  cellos: 'vsco2-cellos-susvib-mp',
  trumpet: 'vsco2-trumpet-sus-mf',
  trumpet2: 'vsco2-trumpet-sus-f',
  didgeridoo: 'vcsl-didgeridoo-sus',
  hats: 'itslucid-lofi-hats',
  kick: 'itslucid-lofi-kick',
  snare: 'itslucid-lofi-snare',
  glasses: 'vcsl-wine-glasses-slow',
  claves: 'vcsl-claves',
  ocean: 'vcsl-ocean-drum',
  guitar: 'acoustic-guitar-chords-cmaj',
  guitar2: 'dry-guitar-vib',
  guitar3: 'guitar-namaste',
  guitar4: 'acoustic-guitar',
  guitar5: 'guitar-dusty',
  guitar6: 'guitar-harmonics',
  bassdrum: 'vcsl-bassdrum-hit-f',
  bassdrum2: 'vcsl-bassdrum-hit-ff',
  bells: 'vcsl-sleighbells',
  cymbals: 'vcsl-finger-cymbals',
  tom: 'vcsl-tom',
  ahum1: 'alex-hum-1',
  ahum2: 'alex-hum-2',
  marimba: 'vsco2-marimba',
  spank: 'guitar-coil-spank',
  sax: 'vcsl-tenor-sax-vib',
  truck: 'idling-truck',
  mallets: 'vcsl-vibraphone-soft-mallets-mp',
  whales: 'whales',
  chorus: 'sso-chorus-female',
  chorus2: 'sso-chorus-male',
  harp: 'vsco2-harp',
  gliss: 'dan-tranh-gliss-ps',
  darbuka: 'vcsl-darbuka-1-f',
  darbuka2: 'vcsl-darbuka-2-f',
  darbuka3: 'vcsl-darbuka-3-f',
  darbuka4: 'vcsl-darbuka-4-f',
  darbuka5: 'vcsl-darbuka-5-f',
  trombbone: 'vsco2-trombone-sus-mf',
  waves: 'waves',
  stir: 'snare-brush-stir',
  hit: 'snare-brush-hit-p',
  ride: 'ride-brush-p',
  birds: 'birds',
  explosion: 'explosion'
};

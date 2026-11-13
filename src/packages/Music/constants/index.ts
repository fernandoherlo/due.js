import type { IApp, IEffect, IInstruction, IInstrument, IMidiIn } from '~/src/types';
import { COMMANDS } from '~/src/packages/Compiler/constants';

import Synth from '../services/Instrument/Synth';
import Sampler from '../services/Instrument/Sampler';
import MidiSampler from '../services/Instrument/MidiSampler';
import MidiOut from '../services/Instrument/MidiOut';
import Magenta from '../services/Instrument/Magenta';
import VariableLive from '../services/VariableLive';
import Bus from '../services/Bus';
import MidiIn from '../services/MidiIn';
import { EFFECTS_MAP } from './effects';

export const COMMANDS_ELEMENT_MAP: Record<typeof COMMANDS[keyof typeof COMMANDS], (instruction: IInstruction, app: IApp) => IInstrument | IMidiIn | IEffect> = {
  [COMMANDS.n]: (instruction: IInstruction, app: IApp) => new Synth(instruction, app),
  [COMMANDS.sam]: (instruction: IInstruction, app: IApp) => new Sampler(instruction, app),
  [COMMANDS.misam]: (instruction: IInstruction, app: IApp) => new MidiSampler(instruction, app),
  [COMMANDS.mo]: (instruction: IInstruction, app: IApp) => new MidiOut(instruction, app),
  [COMMANDS.mi]: (instruction: IInstruction, app: IApp) => new MidiIn(instruction, app),
  ...EFFECTS_MAP,
  [COMMANDS.$$]: (instruction: IInstruction, app: IApp) => new VariableLive(instruction, app),
  [COMMANDS.ai]: (instruction: IInstruction, app: IApp) => new Magenta(instruction, app),
  [COMMANDS.bus]: (instruction: IInstruction, app: IApp) => new Bus(instruction, app)
};

import { IApp, IInstruction } from '../../vite-env';
import { COMMANDS  } from "../../Compiler/constants";

import Synth from '../Instrument/Synth';
import Sampler from '../Instrument/Sampler';

export const COMMANDS_INSTRUMENT_MAP: any = {
  [COMMANDS.n]: (instruction: IInstruction, app: IApp) => new Synth(instruction, app),
  [COMMANDS.sam]: (instruction: IInstruction, app: IApp) => new Sampler(instruction, app)
};

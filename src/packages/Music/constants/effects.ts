import { COMMANDS } from '~/src/packages/Compiler/constants';
import type { EffectsMap, IApp, IInstruction } from '~/src/types';
import Chorus from '../services/Effect/Chorus';
import Delay from '../services/Effect/Delay';
import Reverb from '../services/Effect/Reverb';
import Volumen from '../services/Effect/Volumen';

export const EFFECTS_MAP: EffectsMap = {
  [COMMANDS.v]: (instruction: IInstruction, app: IApp) => new Volumen(instruction, app),
  [COMMANDS.r]: (instruction: IInstruction, app: IApp) => new Reverb(instruction, app),
  [COMMANDS.d]: (instruction: IInstruction, app: IApp) => new Delay(instruction, app),
  [COMMANDS.cho]: (instruction: IInstruction, app: IApp) => new Chorus(instruction, app)
};

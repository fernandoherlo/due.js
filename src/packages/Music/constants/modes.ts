import { COMMANDS } from '~/src/packages/Compiler/constants';
import type { IModeClass } from '~/src/types';
import Reverse from '../services/Modes/Reverse';

export const MODES_MAP: Record<string, IModeClass> = {
  [COMMANDS.reverse]: Reverse
};

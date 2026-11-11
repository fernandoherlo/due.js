import { COMMANDS } from '~/src/packages/Compiler/constants';
import type { IOperatorClass } from '~/src/types';
import Chord from '../services/Operators/Chord';
import Human from '../services/Operators/Human';
import Late from '../services/Operators/Late';
import Octave from '../services/Operators/Octave';
import Unique from '../services/Operators/Unique';

export const OPERATORS_MAP: Record<string, IOperatorClass> = {
  [COMMANDS.oct]: Octave,
  [COMMANDS.late]: Late,
  [COMMANDS.chord]: Chord,
  [COMMANDS.human]: Human,
  [COMMANDS.unique]: Unique
};

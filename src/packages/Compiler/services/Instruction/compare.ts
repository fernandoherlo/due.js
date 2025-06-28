import type { IInstruction } from '~/src/types';
import { stringify, parse } from 'flatted';

export function areDifferentInstructions (newInst: IInstruction, lastInst: IInstruction): boolean {
  const newInstCloned = { ...newInst };
  const lastInstCloned = { ...lastInst };

  const newInstCleared = _clearInstruction(newInstCloned);
  const lastInstCleared = _clearInstruction(lastInstCloned);

  return stringify(newInstCleared) !== stringify(lastInstCleared);
}

function _clearInstruction (instruction: IInstruction): any {
  const clonedInstruction = parse(stringify(instruction));

  delete clonedInstruction.instrument;
  delete clonedInstruction.midi;
  delete clonedInstruction.effect;
  delete clonedInstruction.app;
  delete clonedInstruction.canUpdate;
  delete clonedInstruction.loop;
  delete clonedInstruction.valueStep;

  if (clonedInstruction?.actions?.length) {
    clonedInstruction.actions = clonedInstruction.actions.map((action: IInstruction) => {
      return _clearInstruction(action);
    });
  }

  return clonedInstruction;
}

import { stringify, parse } from 'flatted';
import { IInstruction } from '~/src/vite-env';

export function compareInstructions (newInst: IInstruction, lastInst: IInstruction): boolean {
  const newInstCloned = { ...newInst };
  const lastInstCloned = { ...lastInst };

  const newInstCleared = _clearInstruction(newInstCloned);
  const lastInstCleared = _clearInstruction(lastInstCloned);

  return stringify(newInstCleared) !== stringify(lastInstCleared);
}

function _clearInstruction (instruction: IInstruction): any {
  const clonedInstruction = parse(stringify(instruction));

  delete clonedInstruction._instrument;
  delete clonedInstruction._midi;
  delete clonedInstruction._effect;
  delete clonedInstruction._app;
  delete clonedInstruction._canUpdate;
  delete clonedInstruction._loop;
  delete clonedInstruction._valueStep;

  if (clonedInstruction?.actions?.length) {
    clonedInstruction.actions = clonedInstruction.actions.map((action: IInstruction) => {
      return _clearInstruction(action);
    });
  }

  return clonedInstruction;
}

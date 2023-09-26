import { stringify, parse } from 'flatted';

export function compareInstructions (newInst: any, lastInst: any) {
  const newInstClone = { ...newInst };
  const lastInstClone = { ...lastInst };

  const newInstCleared = _clearInstruction(newInstClone);
  const lastInstCleared = _clearInstruction(lastInstClone);

  return stringify(newInstCleared) !== stringify(lastInstCleared);
}

function _clearInstruction (instruction: any) {
  const clone = parse(stringify(instruction));

  delete clone._instrument;
  delete clone._effect;
  delete clone._app;
  delete clone._canUpdate;
  delete clone._schedule;
  delete clone._valueStep;

  if (clone?.actions?.length) {
    clone.actions = clone.actions.map((action: any) => {
      return _clearInstruction(action);
    });
  }

  return clone;
}

import { OPERATORS } from '~/src/packages/Compiler/constants';
import { OPERATORS_MAP } from '~/src/packages/Music/constants/operators';
import type { IInstruction, IOperator } from '~/src/types';

export function createOperator (action: IInstruction): IOperator {
  return new OPERATORS_MAP[action.name](action);
}

export function createOperators (actions: readonly IInstruction[]): IOperator[] {
  return actions.filter(action => action.mode && OPERATORS.includes(action.name)).map(createOperator);
}

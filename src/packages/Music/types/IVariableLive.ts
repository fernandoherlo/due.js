import type { IInstruction } from '~/src/types';
import type { ILiveVariableConfig } from '~/src/packages/Compiler/types/ILiveVariableConfig';

export interface IVariableLive extends IInstruction {
  value: ILiveVariableConfig;

  start: () => Promise<void>;
  end: () => Promise<void>;
  update: (newVariable: IVariableLive) => Promise<void>;
}

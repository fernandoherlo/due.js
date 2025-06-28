import type { IInstruction } from '~/src/types';

export interface IVariableLive extends IInstruction {
  value: any;

  start: () => Promise<void>;
  end: () => Promise<void>;
  update: (newVariable: IVariableLive) => Promise<void>;
}

import { IInstruction } from '~/src/vite-env';

export interface IVariableLive extends IInstruction {
  value: any;

  start: () => Promise<void>;
  end: () => Promise<void>;
  update: (newVariable: IVariableLive) => Promise<void>;
}

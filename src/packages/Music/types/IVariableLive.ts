import { IApp, IInstruction } from '~/src/vite-env';

export interface IVariableLive extends IInstruction {
  _app: IApp;
  value: any;

  start: () => Promise<void>;
  end: () => Promise<void>;
  update: (newVariable: IVariableLive) => Promise<void>;
}

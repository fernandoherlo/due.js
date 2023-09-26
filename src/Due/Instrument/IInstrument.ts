import { IApp, IInstruction } from '../../vite-env';

export interface IInstrument extends IInstruction {
  _app: IApp;
  _instrument: any | null;
  _canUpdate: boolean;
  _schedule: number | null;
  _valueStep: number;

  start: () => Promise<void>;
  startActions: () => Promise<void>;
  end: () => Promise<void>;
  play: () => Promise<void>;
  update: (newIntrument: IInstrument) => Promise<void>;
}

import { IInstruction } from '../../vite-env';

export interface IInstrument extends IInstruction {
  _instrument: any | null;
  _canUpdate: boolean;

  start: () => Promise<void>;
  end: () => Promise<void>;
  play: () => Promise<void>;
  update: (newIntrument: IInstrument) => Promise<void>;
}

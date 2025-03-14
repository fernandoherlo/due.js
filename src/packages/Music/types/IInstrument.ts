import { IInstruction } from '~/src/vite-env';

export interface IInstrument extends IInstruction {
  start: () => Promise<void>;
  startActions: () => Promise<void>;
  end: () => Promise<void>;
  play: () => Promise<void>;
  update: (newIntrument: IInstrument) => Promise<void>;
}

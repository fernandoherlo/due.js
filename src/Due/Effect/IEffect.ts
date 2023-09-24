import { IInstrument } from '../Instrument/IInstrument';

export interface IEffect extends IInstrument {
  _effect: any | null;

  create: () => void;
  toDestination: () => void;
  connect: (action: IEffect) => void;
  end: () => Promise<void>
}

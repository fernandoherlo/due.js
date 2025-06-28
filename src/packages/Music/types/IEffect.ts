import type { IInstrument } from '~/src/types';

export interface IEffect extends IInstrument {
  create: () => void;
  toDestination: () => void;
  connect: (action: IEffect) => void;
  end: () => Promise<void>
}

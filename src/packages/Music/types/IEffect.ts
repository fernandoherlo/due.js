import { IInstrument } from '~/src/vite-env';

export interface IEffect extends IInstrument {
  create: () => void;
  toDestination: () => void;
  connect: (action: IEffect) => void;
  end: () => Promise<void>
}

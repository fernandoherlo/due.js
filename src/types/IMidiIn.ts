import { IApp, IInstruction } from '~/src/vite-env';

export interface IMidiIn extends IInstruction {
  _app: IApp;

  start: () => Promise<void>;
  end: () => Promise<void>;
  update: (newMidi: IMidiIn) => Promise<void>;
}

import { IInstruction } from '~/src/vite-env';

export interface IMidiIn extends IInstruction {
  start: () => Promise<void>;
  end: () => Promise<void>;
  update: (newMidi: IMidiIn) => Promise<void>;
}

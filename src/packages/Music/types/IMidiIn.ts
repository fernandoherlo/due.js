import type { IInstruction } from '~/src/types';

export interface IMidiIn extends IInstruction {
  start: () => Promise<void>;
  end: () => Promise<void>;
  update: (newMidi: IMidiIn) => Promise<void>;
}

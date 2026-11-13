import type { IInstruction } from '~/src/types';

export interface IMusic {
  start: () => Promise<void>;
  toggle: () => Promise<void>;
  setTempo: (bpm: number) => void;
  waitForNextBar: (bpm: number) => Promise<void>;
  toggleMute: (key: string) => boolean;
  isMuted: (key: string) => boolean;
  validate: (instructions: Array<IInstruction>) => void;
  add: (instructions: Array<IInstruction>) => Promise<void>;
  update: (instructions: Array<IInstruction>, previousInstructions?: Record<string, IInstruction>) => Promise<void>;
  delete: (instructions: Array<IInstruction>) => Promise<void>;
}

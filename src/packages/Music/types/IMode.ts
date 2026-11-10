import type * as Tone from 'tone';
import type { IInstruction } from '~/src/types';

export type Playback = (buffer: AudioBuffer, duration: number) => AudioBuffer;

export interface IMode extends Tone.Sampler {
  playback: () => Playback;
}

export interface IModeClass {
  new (action: IInstruction, buffers: Record<string, AudioBuffer>): IMode;
  parse: (action: IInstruction) => unknown;
}

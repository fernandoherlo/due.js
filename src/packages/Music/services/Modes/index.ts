import * as Tone from 'tone';
import { toMidi } from '~/src/packages/Music/helpers/toMidi';
import type { IInstruction, IMode, Playback } from '~/src/types';

export type SampleNote = number;
type Notes = Parameters<Tone.Sampler['triggerAttackRelease']>[0];

export default abstract class Mode extends Tone.Sampler implements IMode {
  private readonly samples: Map<SampleNote, AudioBuffer>;

  constructor (protected readonly action: IInstruction, buffers: Record<string, AudioBuffer>) {
    super({ urls: buffers });
    this.samples = new Map(Object.entries(buffers).map(([note, buffer]) => [toMidi(note), buffer] as const));
  }

  static async loadBuffers (urls: Record<string, string>): Promise<Record<string, AudioBuffer>> {
    const buffers = await Promise.all(Object.entries(urls).map(async ([note, url]) =>
      [note, await Tone.ToneAudioBuffer.load(url)] as const));
    return Object.fromEntries(buffers);
  }

  abstract playback (): Playback;

  override triggerAttackRelease (notes: Notes, duration: number): this {
    const play = this.playback();
    for (const note of [notes].flat()) {
      const frequency = Tone.Frequency(note);
      const closest = this.closestSample(frequency.toMidi());
      const buffer = this.samples.get(closest)!;
      const rate = frequency.toFrequency() / Tone.Frequency(closest, 'midi').toFrequency();
      this.add(closest, play(buffer, duration * rate));
      super.triggerAttackRelease(note, duration);
    }
    return this;
  }

  private closestSample (midi: SampleNote): SampleNote {
    return [...this.samples.keys()].reduce((closest, candidate) => {
      const difference = Math.abs(candidate - midi) - Math.abs(closest - midi);
      return difference < 0 || (difference === 0 && candidate > closest) ? candidate : closest;
    });
  }
}

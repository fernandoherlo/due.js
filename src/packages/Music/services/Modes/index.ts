import * as Tone from 'tone';
import { toMidi } from '~/src/packages/Music/helpers/toMidi';
import type { IInstruction, IMode, Playback } from '~/src/types';

type Notes = Parameters<Tone.Sampler['triggerAttackRelease']>[0];
type Time = Parameters<Tone.Sampler['triggerAttackRelease']>[2];

export default abstract class Mode extends Tone.Sampler implements IMode {
  private readonly samples: Map<number, AudioBuffer>;
  private readonly current: Map<number, AudioBuffer>;

  constructor (protected readonly action: IInstruction, buffers: Record<string, AudioBuffer>) {
    super({ urls: buffers });
    this.samples = new Map(Object.entries(buffers).map(([note, buffer]) => [toMidi(note), buffer] as const));
    this.current = new Map(this.samples);
  }

  static async loadBuffers (urls: Record<string, string>): Promise<Record<string, AudioBuffer>> {
    const buffers = await Promise.all(Object.entries(urls).map(async ([note, url]) =>
      [note, await Tone.ToneAudioBuffer.load(url)] as const));
    return Object.fromEntries(buffers);
  }

  abstract playback (): Playback;

  override triggerAttackRelease (notes: Notes, duration: number, time?: Time, velocity?: number): this {
    const play = this.playback();
    for (const note of [notes].flat()) {
      const frequency = Tone.Frequency(note);
      const closest = this.closestSample(frequency.toMidi());
      const rate = frequency.toFrequency() / Tone.Frequency(closest, 'midi').toFrequency();
      const played = play(this.samples.get(closest)!, duration * rate);
      if (this.current.get(closest) !== played) {
        this.add(Tone.Frequency(closest, 'midi').toNote(), played);
        this.current.set(closest, played);
      }
      super.triggerAttackRelease(note, duration, time, velocity);
    }
    return this;
  }

  private closestSample (midi: number): number {
    return [...this.samples.keys()].reduce((closest, candidate) => {
      const difference = Math.abs(candidate - midi) - Math.abs(closest - midi);
      return difference < 0 || (difference === 0 && candidate > closest) ? candidate : closest;
    });
  }
}

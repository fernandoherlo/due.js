import { noteToMidi } from '~/src/packages/Music/helpers/transpose';
import type { IInstruction, INoteEvent } from '~/src/types';
import Operator from '../index';

// ::walk(semitones) limits the leap from the previous single note, picking a nearer note of the same list when needed.
export default class Walk extends Operator {
  private readonly maxStep: number;
  private last?: number;

  constructor (action: IInstruction) {
    super();
    const [maxStep] = Operator.numbers(action, 1, 1);
    if (maxStep < 0) throw Error(`${Operator.label(action)} semitones must be 0 or more.`);
    this.maxStep = maxStep;
  }

  apply (event: INoteEvent): INoteEvent {
    const [note] = event.notes;
    const midi = event.notes.length === 1 ? noteToMidi(note) : undefined;
    if (midi === undefined) return event;

    if (this.last === undefined || Math.abs(midi - this.last) <= this.maxStep) {
      this.last = midi;
      return event;
    }

    const last = this.last;
    const candidates = (event.pool ?? [])
      .map(name => ({ name, midi: noteToMidi(name) }))
      .filter((candidate): candidate is { name: string, midi: number } => candidate.midi !== undefined);
    if (!candidates.length) return event;

    const near = candidates.filter(candidate => Math.abs(candidate.midi - last) <= this.maxStep);
    const closest = Math.min(...candidates.map(candidate => Math.abs(candidate.midi - last)));
    const options = near.length ? near : candidates.filter(candidate => Math.abs(candidate.midi - last) === closest);
    const chosen = options[Math.floor(Math.random() * options.length)];
    this.last = chosen.midi;
    return { ...event, notes: [chosen.name] };
  }
}

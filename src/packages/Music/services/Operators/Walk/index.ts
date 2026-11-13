import { noteToMidi } from '~/src/packages/Music/helpers/transpose';
import type { IInstruction, INoteEvent } from '~/src/types';
import Operator from '../index';

// ::walk(semitones) limits the leap from the previous single note, picking a nearer note of the same list when needed.
export default class Walk extends Operator {
  override readonly needsPool = true;
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
    const near: Array<{ name: string, midi: number }> = [];
    let closest: Array<{ name: string, midi: number }> = [];
    let closestDistance = Infinity;
    for (const name of event.pool ?? []) {
      const midi = noteToMidi(name);
      if (midi === undefined) continue;
      const distance = Math.abs(midi - last);
      const candidate = { name, midi };
      if (distance <= this.maxStep) near.push(candidate);
      if (distance < closestDistance) {
        closestDistance = distance;
        closest = [candidate];
      } else if (distance === closestDistance) {
        closest.push(candidate);
      }
    }
    if (!closest.length) return event;

    const options = near.length ? near : closest;
    const chosen = options[Math.floor(Math.random() * options.length)];
    this.last = chosen.midi;
    return { ...event, notes: [chosen.name] };
  }
}

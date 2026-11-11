import { SEMITONES_PER_OCTAVE } from '~/src/packages/Music/constants/notes';
import { transpose } from '~/src/packages/Music/helpers/transpose';
import type { IInstruction, INoteEvent } from '~/src/types';
import Operator from '../index';

// ::oct(probability;octaves) shifts every note by the given octaves (default 1).
export default class Octave extends Operator {
  private readonly probability: number;
  private readonly octaves: number;

  constructor (action: IInstruction) {
    super();
    const [probability, octaves = 1] = Operator.numbers(action, 1, 2);
    if (!Number.isInteger(octaves)) throw Error(`${Operator.label(action)} octaves must be an integer.`);
    this.probability = Operator.probability(action, probability);
    this.octaves = octaves;
  }

  apply (event: INoteEvent): INoteEvent {
    if (!Operator.chance(this.probability)) return event;
    const semitones = this.octaves * SEMITONES_PER_OCTAVE;
    return { ...event, notes: event.notes.map(note => transpose(note, semitones)) };
  }
}

import { SEMITONES_PER_FIFTH, SEMITONES_PER_OCTAVE } from '~/src/packages/Music/constants/notes';
import { transpose } from '~/src/packages/Music/helpers/transpose';
import type { IInstruction, INoteEvent } from '~/src/types';
import Operator from '../index';

// ::chord(probability) adds a fifth and an octave above every note.
export default class Chord extends Operator {
  private readonly probability: number;

  constructor (action: IInstruction) {
    super();
    this.probability = Operator.probability(action, Operator.numbers(action, 1, 1)[0]);
  }

  apply (event: INoteEvent): INoteEvent {
    if (!Operator.chance(this.probability)) return event;
    const added = event.notes.flatMap(note => [transpose(note, SEMITONES_PER_FIFTH), transpose(note, SEMITONES_PER_OCTAVE)]);
    return { ...event, notes: [...event.notes, ...added] };
  }
}

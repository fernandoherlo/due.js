import { transpose } from '~/src/packages/Music/helpers/transpose';
import type { IInstruction, INoteEvent } from '~/src/types';
import Operator from '../index';

// ::trans(semitones) shifts every note by a fixed amount (negative goes down).
export default class Trans extends Operator {
  private readonly semitones: number;

  constructor (action: IInstruction) {
    super();
    const [semitones] = Operator.numbers(action, 1, 1);
    if (!Number.isInteger(semitones)) throw Error(`${Operator.label(action)} semitones must be an integer.`);
    this.semitones = semitones;
  }

  apply (event: INoteEvent): INoteEvent {
    return { ...event, notes: event.notes.map(note => transpose(note, this.semitones)) };
  }
}

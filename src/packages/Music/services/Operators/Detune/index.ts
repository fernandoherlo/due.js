import type { IInstruction, INoteEvent } from '~/src/types';
import Operator from '../index';

const MAX_DETUNE_CENTS = 100;

export default class Detune extends Operator {
  private readonly maxCents: number;

  constructor (action: IInstruction) {
    super();
    const [maxCents] = Operator.numbers(action, 1, 1);
    if (maxCents < 0 || maxCents > MAX_DETUNE_CENTS) {
      throw Error(`${Operator.label(action)} detune must be between 0 and ${MAX_DETUNE_CENTS} cents.`);
    }
    this.maxCents = maxCents;
  }

  apply (event: INoteEvent): INoteEvent {
    const detune = (Math.random() * 2 - 1) * this.maxCents;
    return { ...event, detune };
  }
}

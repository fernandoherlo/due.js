import type { IInstruction, INoteEvent } from '~/src/types';
import Operator from '../index';

const DEFAULT_MAX_DELAY = 0.5;

// ::late(probability;maxSeconds) delays the note by a random time up to maxSeconds (default 0.5).
export default class Late extends Operator {
  private readonly probability: number;
  private readonly maxDelay: number;

  constructor (action: IInstruction) {
    super();
    const [probability, maxDelay = DEFAULT_MAX_DELAY] = Operator.numbers(action, 1, 2);
    if (maxDelay < 0) throw Error(`${Operator.label(action)} delay must be 0 or more.`);
    this.probability = Operator.probability(action, probability);
    this.maxDelay = maxDelay;
  }

  apply (event: INoteEvent): INoteEvent {
    if (event.time === undefined || !Operator.chance(this.probability)) return event;
    return { ...event, time: event.time + Math.random() * this.maxDelay };
  }
}

import type { IInstruction, INoteEvent } from '~/src/types';
import Operator from '../index';

const DEFAULT_AMOUNT = 0.03;
const DURATION_VARIATION = 0.1;

// ::human(seconds) delays every note up to the given seconds (default 0.03) and varies its duration by 10 %.
export default class Human extends Operator {
  private readonly amount: number;

  constructor (action: IInstruction) {
    super();
    const [amount = DEFAULT_AMOUNT] = Operator.numbers(action, 0, 1);
    if (amount < 0) throw Error(`${Operator.label(action)} amount must be 0 or more.`);
    this.amount = amount;
  }

  apply (event: INoteEvent): INoteEvent {
    const variation = 1 - DURATION_VARIATION + Math.random() * 2 * DURATION_VARIATION;
    return {
      ...event,
      time: event.time === undefined ? undefined : event.time + Math.random() * this.amount,
      duration: event.duration * variation
    };
  }
}

import type { IInstruction, INoteEvent } from '~/src/types';
import Operator from '../index';

// ::unique(seconds) drops a note that already sounded in the last `seconds`; if none remains, the step is silent.
export default class Unique extends Operator {
  private readonly window: number;
  private readonly lastPlayed = new Map<string, number>();

  constructor (action: IInstruction) {
    super();
    const [window] = Operator.numbers(action, 1, 1);
    if (window < 0) throw Error(`${Operator.label(action)} seconds must be 0 or more.`);
    this.window = window;
  }

  apply (event: INoteEvent): INoteEvent {
    const { time } = event;
    if (time === undefined) return event;
    const notes = event.notes.filter(note => time - (this.lastPlayed.get(note) ?? -Infinity) >= this.window);
    notes.forEach(note => this.lastPlayed.set(note, time));
    return { ...event, notes };
  }
}

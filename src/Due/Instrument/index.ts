import * as Tone from 'tone';
import { IApp, IInstruction, IInstrument, INote } from '../../vite-env';
import Instruction from '../../Compiler/Instruction';
import { COMMANDS_ELEMENT_MAP } from '../constants';

export default class Instrument extends Instruction implements IInstrument {
  _app: IApp;
  _instrument: any | null = null;
  _canUpdate: boolean = false;
  _schedule: number | null = null;

  constructor (data: any, app: IApp) {
    super(data);

    this._app = app;
  }

  async start (): Promise<void> {
    await this.play();
  }

  async startActions (): Promise<void> {
    let lastAction: any | null = null;

    for (let i = 0; i < this.actions.length; i++) {
      const action: IInstruction = this.actions[i];

      const element = COMMANDS_ELEMENT_MAP[action.name](action, this._app);
      await element.create();
      this.actions[i] = element;

      if (i === 0) {
        this.actions[i].toDestination();
      } else {
        if (lastAction) {
          this.actions[i].connect(lastAction);
        }
      }

      lastAction = element;
    }

    return lastAction;
  }

  async play (): Promise<void> {
    if (this._schedule) {
      await Tone.Transport.clear(this._schedule);
    }

    let note: INote;
    note = this._getValue(this.value);

    this._schedule = Tone.Transport.scheduleRepeat(async (time: number) => {
      if (this._instrument) {
        note = this._getValue(this.value);
        this._instrument.triggerAttackRelease(note.value, this._getValue(note.duration), time);
      }
      if (Array.isArray(note.interval)) {
        await this.play();
      }
    }, this._getValue(note.interval));
  }

  async end (): Promise<void> {
    if (this._schedule) {
      await Tone.Transport.clear(this._schedule);
    }
    if (this.actions) {
      for (let i = 0; i < this.actions.length; i++) {
        await this.actions[i]._effect.disconnect();
        await this.actions[i]._effect.dispose();
      }
    }
    if (this._instrument) {
      await this._instrument.disconnect();
      await this._instrument.dispose();
    }
  }

  async update (newInstrument: IInstrument): Promise<void> {
    if (this._canUpdate) {
      this.value = newInstrument.value;
      this.sound = newInstrument.sound;
      await this.play();
    }
  }

  _getValue (values: any | Array<any>) {
    let value;
    if (Array.isArray(values)) {
      value = this._getRandom(values);
    } else if (
      typeof values === 'object' &&
      !Array.isArray(values) &&
      (values.min && values.max)
    ) {
      value = this._getRandomMinMax(values);
    } else {
      value = values;
    }

    return value;
  }

  _getRandom (values: Array<any>) {
    return values[Math.floor(Math.random() * values.length)];
  }

  _getRandomMinMax (values: any) {
    const min = Math.ceil(values.min);
    const max = Math.floor(values.max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}

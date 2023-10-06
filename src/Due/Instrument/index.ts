import * as Tone from 'tone';
import { IApp, IInstruction, IInstrument, INote } from '../../vite-env';
import Instruction from '../../Compiler/Instruction';
import { COMMANDS_ELEMENT_MAP, TYPE_VALUE_NOTE } from '../constants';

export default class Instrument extends Instruction implements IInstrument {
  _app: IApp;
  _instrument: any | null = null;
  _canUpdate: boolean = false;
  _schedule: number | null = null;
  _valueStep: number = 0;

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

    this._schedule = Tone.Transport.scheduleRepeat(async (/* time: number */) => {
      if (this._instrument) {
        note = this._getValue(this.value, this.typeValue);
        if (note.value) {
          if (this._isChord(note.value, this.typeValue)) {
            if (!Array.isArray(note.value)) {
              this._instrument.triggerAttackRelease(this._createChord(note.value), this._getValue(note.duration));
            } else {
              this._instrument.triggerAttackRelease(note.value, this._getValue(note.duration));
            }
          } else {
            this._instrument.triggerAttackRelease(note.value, this._getValue(note.duration), /* time */ '+0.05');
          }
        }
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
        await this.actions[i].end();
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
      this.typeValue = newInstrument.typeValue;
      this.sound = newInstrument.sound;
      await this.play();
    }
  }

  _getValue (values: any | Array<any>, typeValue?: string | undefined) {
    let value;
    if (Array.isArray(values)) {
      if (typeValue === TYPE_VALUE_NOTE.sequence) {
        value = values[this._valueStep % values.length];
        this._valueStep++;
      } else if (typeValue === TYPE_VALUE_NOTE.random) {
        value = this._getRandom(values);
      } else {
        value = this._getRandom(values);
      }
    } else if (
      typeof values === 'object' &&
      !Array.isArray(values) &&
      (values.min && values.max)
    ) {
      value = this._getRandomMinMax(values);
    } else {
      value = values;
      if (this._isChord(value.value, typeValue) && !Array.isArray(value.value)) {
        value.value = this._createChord(value.value);
      }
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

  _isChord (value: string | Array<string>, typeValue: string | undefined) {
    if (typeof value === 'string' && typeValue) {
      return typeValue === TYPE_VALUE_NOTE.chord || ((typeValue === TYPE_VALUE_NOTE.random || typeValue === TYPE_VALUE_NOTE.sequence) && value.includes('='));
    } else if (Array.isArray(value) && typeValue) {
      return true;
    }
  }

  _createChord (string: string): Array<string> {
    return string.replace(/\[|\]/g, '').trim().split('=');
  }
}

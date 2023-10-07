import { INote } from '~/src/vite-env';
import { TYPE_VALUE_NOTE } from '../constants';

export default class TriggerAttack {
  static play (value: any, typeValue: string, valueStep: number, instrument: any) {
    const note: INote = TriggerAttack.getValue(value, typeValue, valueStep);
    if (note.value) {
      if (this._isChord(note.value, typeValue)) {
        if (!Array.isArray(note.value)) {
          instrument.triggerAttackRelease(this._createChord(note.value), TriggerAttack.getValue(note.duration));
        } else {
          instrument.triggerAttackRelease(note.value, TriggerAttack.getValue(note.duration));
        }
      } else {
        instrument.triggerAttackRelease(note.value, TriggerAttack.getValue(note.duration), /* time */ '+0.05');
      }
    }
  }

  static getValue (values: any | Array<any>, typeValue?: string | undefined, valueStep?: number | undefined) {
    let value;
    if (Array.isArray(values)) {
      if (typeValue === TYPE_VALUE_NOTE.sequence && valueStep) {
        value = values[valueStep % values.length];
        valueStep++;
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

  static _getRandom (values: Array<any>) {
    return values[Math.floor(Math.random() * values.length)];
  }

  static _getRandomMinMax (values: any) {
    const min = Math.ceil(values.min);
    const max = Math.floor(values.max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  static _isChord (value: string | Array<string>, typeValue: string | undefined) {
    if (typeof value === 'string' && typeValue) {
      return typeValue === TYPE_VALUE_NOTE.chord || ((typeValue === TYPE_VALUE_NOTE.random || typeValue === TYPE_VALUE_NOTE.sequence) && value.includes('='));
    } else if (Array.isArray(value) && typeValue) {
      return true;
    }
  }

  static _createChord (string: string): Array<string> {
    return string.replace(/\[|\]/g, '').trim().split('=');
  }
}

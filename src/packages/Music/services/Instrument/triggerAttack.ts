import { INote } from '~/src/vite-env';
import { TYPE_VALUE } from '~/src/packages/Compiler/constants';

export default class TriggerAttack {
  static play (value: any, typeValue: string, valueStep: number, instrument: any): any[] | undefined {
    const note: INote = TriggerAttack.getValue(value, typeValue, valueStep);
    if (note.value) {
      const duration = parseFloat(TriggerAttack.getValue(note.duration));

      if (this._isChord(note.value, typeValue)) {
        if (!Array.isArray(note.value)) {
          instrument.triggerAttackRelease(this._createChord(note.value), duration);
        } else {
          instrument.triggerAttackRelease(note.value, duration);
        }
      } else {
        instrument.triggerAttackRelease(note.value, duration);
      }

      return [note.value, duration];
    }
  }

  static getValue (values: any | Array<any>, typeValue?: string | undefined, valueStep: number | undefined = 0) {
    let value;

    if (Array.isArray(values)) {
      if (typeValue === TYPE_VALUE.sequence) {
        value = values[valueStep % values.length];
      } else if (typeValue === TYPE_VALUE.random) {
        value = this._getRandom(values);
      } else {
        value = this._getRandom(values);
      }
    } else if (typeof values === 'object' && (values.min && values.max)) {
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
      return typeValue === TYPE_VALUE.multi || ((typeValue === TYPE_VALUE.random || typeValue === TYPE_VALUE.sequence) && value.includes('|'));
    } else if (Array.isArray(value) && typeValue) {
      return true;
    }
  }

  static _createChord (string: string): Array<string> {
    return string.replace(/\[|\]/g, '').trim().split('|');
  }
}

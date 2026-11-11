import type { INote, INoteEvent, IOperator } from '~/src/types';
import { TYPE_VALUE } from '~/src/packages/Compiler/constants';

export default class TriggerAttack {
  static play (
    value: any, typeValue: string, valueStep: number, instrument: any, time?: number, operators: readonly IOperator[] = []
  ): any[] | undefined {
    const note: INote = TriggerAttack.getValue(value, typeValue, valueStep);
    if (note.value) {
      const duration = parseFloat(TriggerAttack.getValue(note.duration));
      let played = this._isChord(note.value, typeValue) && !Array.isArray(note.value)
        ? this._createChord(note.value)
        : note.value;
      let playedDuration = duration;
      let playedTime = time;

      if (operators.length) {
        const event = operators.reduce<INoteEvent>((current, operator) => operator.apply(current), {
          notes: [played].flat(), duration, time, pool: TriggerAttack.getPool(value)
        });
        if (!event.notes.length) return;
        played = Array.isArray(played) || event.notes.length > 1 ? event.notes : event.notes[0];
        playedDuration = event.duration;
        playedTime = event.time;
      }

      instrument.triggerAttackRelease(played, playedDuration, playedTime);

      return [operators.length ? played : note.value, playedDuration];
    }
  }

  static getPool (value: any): string[] {
    const candidates = Array.isArray(value) ? value : [value];
    return candidates.map(candidate => candidate?.value).filter(item => typeof item === 'string' && !item.includes('|'));
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
    } else if (
      typeof values === 'object' &&
      values !== null &&
      values.min !== undefined &&
      values.max !== undefined
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
    const min = parseFloat(values.min);
    const max = parseFloat(values.max);
    return min + (Math.random() * (max - min));
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

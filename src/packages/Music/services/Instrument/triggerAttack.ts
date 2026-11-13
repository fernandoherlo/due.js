import type { INote, INoteEvent, IOperator } from '~/src/types';
import { REST_VALUE, TYPE_VALUE } from '~/src/packages/Compiler/constants';

export default class TriggerAttack {
  static play (
    value: any,
    typeValue: string,
    valueStep: number,
    instrument: any,
    time?: number,
    operators: readonly IOperator[] = [],
    onPatternStep?: (step: number, time?: number, duration?: number) => void
  ): any[] | undefined {
    const patternStep = Array.isArray(value) ? TriggerAttack.getPatternIndex(value, typeValue, valueStep) : 0;
    const resolvedPatternStep = patternStep ?? 0;
    const note: INote | undefined = Array.isArray(value)
      ? value[resolvedPatternStep]
      : TriggerAttack.getValue(value, typeValue, valueStep);
    if (!note) return;
    if (note.value === REST_VALUE) {
      onPatternStep?.(resolvedPatternStep, time, 0);
      return;
    }
    if (!note.value) return;

    const duration = parseFloat(TriggerAttack.getValue(note.duration));
    let played = this._isChord(note.value, typeValue) && !Array.isArray(note.value)
      ? this._createChord(note.value)
      : note.value;
    let playedDuration = duration;
    let playedTime = time;
    let detune = 0;

    if (operators.length) {
      const pool = operators.some(operator => operator.needsPool) ? TriggerAttack.getPool(value) : undefined;
      const event = operators.reduce<INoteEvent>((current, operator) => operator.apply(current), {
        notes: [played].flat(), duration, time, pool
      });
      if (!event.notes.length) return;
      played = Array.isArray(played) || event.notes.length > 1 ? event.notes : event.notes[0];
      playedDuration = event.duration;
      playedTime = event.time;
      detune = event.detune ?? 0;
    }

    setDetune(instrument, detune, playedTime);
    instrument.triggerAttackRelease(played, playedDuration, playedTime);
    onPatternStep?.(resolvedPatternStep, playedTime, playedDuration);

    return [operators.length ? played : note.value, playedDuration];
  }

  static getPool (value: any): string[] {
    const candidates = Array.isArray(value) ? value : [value];
    return candidates.map(candidate => candidate?.value)
      .filter(item => typeof item === 'string' && !item.includes('|') && item !== REST_VALUE);
  }

  static getValue (values: any | Array<any>, typeValue?: string | undefined, valueStep: number | undefined = 0) {
    let value;

    if (Array.isArray(values)) {
      const index = this.getPatternIndex(values, typeValue, valueStep);
      value = index === undefined ? undefined : values[index];
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

  static getPatternIndex (values: any[], typeValue?: string, valueStep: number = 0): number | undefined {
    if (!values.length) return;
    if (typeValue === TYPE_VALUE.sequence) return valueStep % values.length;
    return this._getRandomIndex(values);
  }

  static _getRandom (values: Array<any>) {
    const index = this._getRandomIndex(values);
    return index === undefined ? undefined : values[index];
  }

  static _getRandomIndex (values: Array<any>): number | undefined {
    if (!values.length) return;
    if (values.some(value => value?.weight !== undefined)) {
      const weights = values.map(value => value?.weight ?? 1);
      const total = weights.reduce((sum, weight) => sum + weight, 0);
      let selection = Math.random() * total;

      for (let index = 0; index < values.length; index++) {
        selection -= weights[index];
        if (selection < 0) return index;
      }

      return values.length - 1;
    }

    return Math.floor(Math.random() * values.length);
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

function setDetune (instrument: any, cents: number, time?: number): void {
  if (!instrument.detune) return;
  if (time === undefined) {
    instrument.detune.value = cents;
    return;
  }
  instrument.detune.setValueAtTime(cents, time);
}

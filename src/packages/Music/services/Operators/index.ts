import type { IInstruction, INoteEvent, IOperator } from '~/src/types';

export default abstract class Operator implements IOperator {
  readonly needsPool: boolean = false;
  abstract apply (event: INoteEvent): INoteEvent;

  protected static label (action: IInstruction): string {
    return `::${action.name}(...)`;
  }

  protected static numbers (action: IInstruction, min: number, max: number): number[] {
    const raw = (action.modeParameters ?? []).map(argument => argument.trim());
    const values = raw.length === 1 && raw[0] === '' ? [] : raw;
    if (values.length < min || values.length > max) {
      throw Error(`${Operator.label(action)} takes ${min === max ? min : `${min} to ${max}`} argument(s).`);
    }
    const numbers = values.map(argument => argument === '' ? Number.NaN : Number(argument));
    if (numbers.some(number => !Number.isFinite(number))) {
      throw Error(`${Operator.label(action)} arguments must be numbers.`);
    }
    return numbers;
  }

  protected static probability (action: IInstruction, value: number): number {
    if (!(value >= 0 && value <= 1)) {
      throw Error(`${Operator.label(action)} probability must be a number between 0 and 1.`);
    }
    return value;
  }

  protected static chance (probability: number): boolean {
    return Math.random() < probability;
  }
}

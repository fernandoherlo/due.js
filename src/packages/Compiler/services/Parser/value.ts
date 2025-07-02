import type { IApp, IValueParser } from '~/src/types';
import { TYPE_VALUE, CHARACTERS_INSTRUCTIONS } from '~/src/packages/Compiler/constants';

export default class ValueParser implements IValueParser {
  private app: IApp;

  constructor (app: IApp) {
    this.app = app;
  }

  exec (valueRaw: string, defaults: boolean) {
    const [value, value2, value3] = valueRaw.trim().split(CHARACTERS_INSTRUCTIONS.SEPARATE_TYPE_VALUES);

    let typeValue = TYPE_VALUE.normal;

    if (this.hasMultipleValues(value)) {
      const valueArray = this.getArrayValue(value);

      let values: string[] = [];
      if (valueArray.includes(CHARACTERS_INSTRUCTIONS.SEPARATE_DIFERRENT_VALUES)) {
        typeValue = TYPE_VALUE.random;
        values = valueArray.trim().split(CHARACTERS_INSTRUCTIONS.SEPARATE_DIFERRENT_VALUES);
      } else if (valueArray.includes(CHARACTERS_INSTRUCTIONS.SEPARATE_PROGRESSION_VALUES)) {
        typeValue = TYPE_VALUE.sequence;
        values = valueArray.trim().split(CHARACTERS_INSTRUCTIONS.SEPARATE_PROGRESSION_VALUES);
      } else if (valueArray.includes(CHARACTERS_INSTRUCTIONS.SEPARATE_CHORD_VALUES)) {
        typeValue = TYPE_VALUE.multi;
        return [this.createValue(value, value2, value3, defaults), typeValue];
      }

      return [values.map(v => this.createValue(v, value2, value3, defaults)), typeValue];
    }

    return [this.createValue(value, value2, value3, defaults), typeValue];
  }

  private createValue (value: string | Array<any>, value2: string | undefined, value3: string | undefined, defaults: boolean) {
    const value2Parse = this.calculateValue(value2);
    const value3Parse = this.calculateValue(value3);

    return this.app.$valueFactory && this.app.$valueFactory.create({ value, value2: value2Parse, value3: value3Parse }, defaults);
  }

  private calculateValue (valueRaw: string | undefined): number | Array<number> | any | undefined {
    if (!valueRaw) {
      return;
    }

    if (this.hasMultipleValues(valueRaw)) {
      const valueArray = this.getArrayValue(valueRaw);

      let values: string[] = [];
      if (valueArray.includes(CHARACTERS_INSTRUCTIONS.SEPARATE_DIFERRENT_VALUES)) {
        values = valueArray.trim().split(CHARACTERS_INSTRUCTIONS.SEPARATE_DIFERRENT_VALUES);
        return values;
      } else if (valueArray.includes(CHARACTERS_INSTRUCTIONS.SEPARATE_MIN_MAX_VALUES)) {
        values = valueArray.trim().split(CHARACTERS_INSTRUCTIONS.SEPARATE_MIN_MAX_VALUES);
        return {
          min: values[0],
          max: values[1]
        };
      }
    }

    return valueRaw;
  }

  private hasMultipleValues (value: string) {
    return value &&
      value.startsWith(CHARACTERS_INSTRUCTIONS.INIT_MULTIPLE_VALUES) &&
      value.endsWith(CHARACTERS_INSTRUCTIONS.END_MULTIPLE_VALUES);
  }

  private getArrayValue (stringArray: string) {
    return stringArray.replace(/\[|\]/g, '');
  }
}

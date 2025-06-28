import type { IApp } from '~/src/types';
import { TYPE_VALUE } from '~/src/packages/Compiler/constants';

export default class Value {
  static valueRaw (app:IApp, valueRaw: string, defaults: boolean) {
    const [value, value2, value3] = valueRaw.trim().split(';');

    let typeValue = TYPE_VALUE.normal;

    if (Value.hasMultipleValues(value)) {
      const valueArray = Value.getArrayValue(value);

      let values: string[] = [];
      if (valueArray.includes(',')) {
        typeValue = TYPE_VALUE.random;
        values = valueArray.trim().split(',');
      } else if (valueArray.includes('>')) {
        typeValue = TYPE_VALUE.sequence;
        values = valueArray.trim().split('>');
      } else if (valueArray.includes('|')) {
        typeValue = TYPE_VALUE.multi;
        return [Value.createValue(app, value, value2, value3, defaults), typeValue];
      }

      return [values.map(v => Value.createValue(app, v, value2, value3, defaults)), typeValue];
    }

    return [Value.createValue(app, value, value2, value3, defaults), typeValue];
  }

  private static createValue (app: IApp, value: string | Array<any>, value2: string | undefined, value3: string | undefined, defaults: boolean) {
    const value2Parse = Value.calculateValue(value2);
    const value3Parse = Value.calculateValue(value3);

    return app.$valueFactory && app.$valueFactory.create({ value, value2: value2Parse, value3: value3Parse }, defaults);
  }

  private static calculateValue (valueRaw: string | undefined): number | Array<number> | any | undefined {
    if (!valueRaw) {
      return;
    }

    if (Value.hasMultipleValues(valueRaw)) {
      const valueArray = Value.getArrayValue(valueRaw);

      let values: string[] = [];
      if (valueArray.includes(',')) {
        values = valueArray.trim().split(',');
        return values;
      } else if (valueArray.includes('-')) {
        values = valueArray.trim().split('-');
        return {
          min: values[0],
          max: values[1]
        };
      }
    }
    return valueRaw;
  }
  
  private static hasMultipleValues (value: string) {
    return value && value.startsWith('[') && value.endsWith(']');
  }

  private static getArrayValue (stringArray: string) {
    return stringArray.replace(/\[|\]/g, '');
  }
}
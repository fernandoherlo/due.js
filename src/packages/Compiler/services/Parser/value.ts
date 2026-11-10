import type { IValueFactory, IValueParser } from '~/src/types';
import type { IAstValue, IAstValueExpression } from '../../types/IAst';
import { TYPE_VALUE } from '~/src/packages/Compiler/constants';

export default class ValueParser implements IValueParser {
  private valueFactory: IValueFactory;

  constructor (valueFactory: IValueFactory) {
    this.valueFactory = valueFactory;
  }

  exec (expression: IAstValueExpression, defaults: boolean) {
    const [value, value2, value3] = expression.values;
    let typeValue = TYPE_VALUE.normal;

    if (value && value.kind === 'collection') {
      let values: IAstValue[] = [];
      if (value.operator === 'random') {
        typeValue = TYPE_VALUE.random;
        values = value.values;
      } else if (value.operator === 'sequence') {
        typeValue = TYPE_VALUE.sequence;
        values = value.values;
      } else if (value.operator === 'chord') {
        typeValue = TYPE_VALUE.multi;
        return [this.createValue(value.rawValue, value2, value3, defaults), typeValue];
      }

      return [values.map(item => this.createValue(item.rawValue, value2, value3, defaults)), typeValue];
    }

    if (value && value.kind === 'range') {
      return [[], typeValue];
    }

    return [this.createValue(value ? value.rawValue : '', value2, value3, defaults), typeValue];
  }

  private createValue (value: string | Array<any>, value2: IAstValue | undefined, value3: IAstValue | undefined, defaults: boolean) {
    const value2Parse = this.calculateValue(value2);
    const value3Parse = this.calculateValue(value3);

    return this.valueFactory.create({ value, value2: value2Parse, value3: value3Parse }, defaults);
  }

  private calculateValue (value: IAstValue | undefined): number | Array<number> | any | undefined {
    if (!value) {
      return;
    }

    if (value.kind === 'collection' && value.operator === 'random') {
      return value.values.map(item => item.rawValue);
    }

    if (value.kind === 'range') {
      return { min: value.min, max: value.max };
    }

    return value.rawValue;
  }
}

import type { INote } from '~/src/types';
import type { IAstValueExpression } from './IAst';

export interface IValueParser {
  exec: (value: IAstValueExpression, defaults: boolean) => (string | INote | undefined)[] | (string | (INote | undefined)[])[];
}

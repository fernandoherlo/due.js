import type { INote } from '~/src/types';

export interface IValueParser {
  exec: (valueRaw: string, defaults: boolean) => (string | INote | undefined)[] | (string | (INote | undefined)[])[];
}

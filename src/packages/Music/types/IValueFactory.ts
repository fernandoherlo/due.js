import type { INote } from '~/src/types';

export interface IValueFactory {
  create: (data: any, defaults: boolean) => INote;
  adapt: (valueRaw: any, variables: any) => any;
}

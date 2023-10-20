import { INote } from '~/src/vite-env';

export interface IValueFactory {
  create: (data: any, defaults: boolean) => INote;
  adapt: (valueRaw: any, variables: any) => any;
}

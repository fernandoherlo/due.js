import type { INote } from '~/src/types';

export interface IInstruction {
  name: string;
  element: string;
  key: string;
  modifier: string | any;
  value: INote | INote[] | any;
  typeValue: string;
  actions: Array<any>;
  type?: string;
}

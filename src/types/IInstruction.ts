import { INote } from '~/src/vite-env';

export interface IInstruction {
  name: string;
  element: string;
  key: string;
  type: string;
  modifier: string | any;
  value: INote | Array<INote>;
  typeValue: string;
  actions: Array<IInstruction>;
}

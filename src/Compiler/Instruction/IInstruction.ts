import { INote } from '../../vite-env';

export interface IInstruction {
  name: string;
  element: string;
  key: string;
  type: string;
  sound: string | any;
  value: INote | Array<INote>;
  typeValue: string;
  actions: Array<IInstruction>;
}

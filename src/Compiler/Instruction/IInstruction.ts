import { INote } from "../../vite-env";

export interface IInstruction {
  name: string;
  element: string;
  key: string;
  type: string;
  sound: string;
  value: INote | Array<INote>;
  actions: Array<IInstruction>;
}

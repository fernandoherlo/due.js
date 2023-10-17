import { IInstruction, INote } from '~/src/vite-env';

export default class Instruction implements IInstruction {
  name: string;
  element: string;
  key: string;
  type: string;
  modifier: string;
  value: INote | Array<INote>;
  typeValue: string;
  actions: Array<any>;

  constructor (data: any) {
    this.name = data.name;
    this.element = data.element;
    this.key = data.key;
    this.type = data.type;
    this.modifier = data.modifier;
    this.value = data.value;
    this.typeValue = data.typeValue;
    this.actions = data.actions;
  }
}

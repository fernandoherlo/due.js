import { IInstruction } from '../../vite-env';

export default class Instruction implements IInstruction {
  name: string;
  element: string;
  key: string;
  type: string;
  value: string;
  actions: Array<IInstruction>;

  constructor (data: any) {
    this.name = data.name;
    this.element = data.element;
    this.key = data.key;
    this.type = data.type;
    this.value = data.value;
    this.actions = data.actions;
  }
}

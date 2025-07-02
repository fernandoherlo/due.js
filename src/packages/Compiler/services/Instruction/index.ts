import type { IInstruction, INote } from '~/src/types';

export default class Instruction implements IInstruction {
  name: string;
  element: string;
  key: string;
  type: string;
  modifier: string;
  value: INote | INote[] | any;
  typeValue: string;
  actions: Array<any>;

  constructor (data: Record<string, any> = {}) {
    this.name = data.name;
    this.element = data.element;
    this.key = data.key
      ? data.key
      : data.element
        ? `${data.name}${data.element}`
        : data.name;
    this.type = data.type;
    this.modifier = data.modifier;
    this.value = data.value;
    this.typeValue = data.typeValue;
    this.actions = data.actions || [];
  }
}

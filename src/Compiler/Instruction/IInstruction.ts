export interface IInstruction {
  name: string;
  element: string;
  key: string;
  type: string;
  value: string;
  actions: Array<IInstruction>;
}

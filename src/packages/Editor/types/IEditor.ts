export interface IEditor {
  create: () => void;
  getCode: () => string | undefined;
}

export interface IMusic {
  start: () => Promise<void>;
  toggle: () => Promise<void>;
  add: (instructions: Array<any>) => Promise<void>;
  update: (instructions: Array<any>) => void;
  delete: (instructions: Array<any>) => Promise<void>;
}

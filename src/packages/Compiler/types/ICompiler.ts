import { IInstruction } from '~/src/vite-env';

export interface ICompiler {
  exec: (code: string) => Array<IInstruction[]>;
}

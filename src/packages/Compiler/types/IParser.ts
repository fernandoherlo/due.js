import { IInstruction } from '~/src/vite-env';

export interface IParser {
  line: (line: string) => string[];
  command: (command: string) => undefined | IInstruction;
}

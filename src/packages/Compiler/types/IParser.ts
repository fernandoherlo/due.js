import type { IInstruction } from '~/src/types';

export interface IParser {
  line: (line: string) => string[];
  command: (command: string) => undefined | IInstruction;
}

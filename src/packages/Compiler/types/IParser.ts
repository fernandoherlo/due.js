export interface IParser {
  line: (line: string) => string[];
  command: (command: string) => undefined | object;
}

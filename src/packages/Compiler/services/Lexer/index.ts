import type { IApp, IParser, ILexer, IInstruction } from '~/src/types';

export default class Lexer implements ILexer {
  private app: IApp;
  private parser: IParser;

  constructor (app: IApp, parser: IParser) {
    this.app = app;
    this.parser = parser;
  }

  exec (code: string): IInstruction[] {
    if (!code) {
      throw Error('Code is empty.');
    }
    if (typeof code !== 'string') {
      throw Error('Code is not string.');
    }

    this.app.$logger.log(code);

    const newCode = code.replace(' ', '');
    return this.generateLexerInstructions(newCode);
  }

  private generateLexerInstructions (code: string): IInstruction[] {
    const lines = code.split('\n');
    const instructionsGroup: IInstruction[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!line || !line.trim() || line.startsWith('//')) {
        continue;
      }

      const instructions = this.parseLine(line);
      if (instructions) {
        instructionsGroup.push(...instructions);
      }
    }

    return instructionsGroup;
  }

  private parseLine (line: string): IInstruction[] {
    const instructions: IInstruction[] = [];
    const commands: string[] = this.parser.line(line);

    if (!Array.isArray(commands)) {
      throw Error('"commands" is not array.');
    }

    commands.forEach((command) => {
      const instruction = this.parser.command(command);
      if (instruction) {
        instructions.push(instruction);
      }
    });

    return instructions;
  }
}

import type { IApp, IParser, ILexer, IInstruction } from '~/src/types';
import Instruction from '../Instruction';
import { COMMANDS_MAP } from '../../constants';

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
    return this.generateLexical(newCode);
  }

  private generateLexical (code: string): IInstruction[] {
    const lines = code.split('\n');
    const lexicalGroup: IInstruction[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!line || !line.trim() || line.startsWith('//')) {
        continue;
      }

      const lexicals = this.parseLine(line);
      if (lexicals) {
        lexicals.forEach(lexical => {
          lexicalGroup.push(lexical);
        });
      }
    }

    return lexicalGroup;
  }

  private parseLine (line: string): IInstruction[] {
    const lexicals: IInstruction[] = [];
    const commands: string[] = this.parser.line(line);

    if (!Array.isArray(commands)) {
      throw Error('"commands" is not array.');
    }

    commands.forEach((command) => {
      const commandParsed = this.parser.command(command);
      if (commandParsed) {
        const lexical = this.newLexical(commandParsed);
        lexicals.push(lexical);
      }
    });

    return lexicals;
  }

  private newLexical (commandParsed: Record<string, any>): IInstruction {
    return new Instruction({
      name: commandParsed.name,
      element: commandParsed.element,
      key: commandParsed.key
        ? commandParsed.key
        : commandParsed.element
          ? `${commandParsed.name}${commandParsed.element}`
          : commandParsed.name,
      type: COMMANDS_MAP[commandParsed.name],
      modifier: commandParsed.modifier,
      value: commandParsed.value,
      typeValue: commandParsed.typeValue,
      actions: []
    });
  }
}

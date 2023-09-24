import { IApp, IParser, ILexer, IInstruction } from '../../vite-env';
import Instruction from '../Instruction';
import { COMMANDS_MAP } from '../constants';

export default class Lexer implements ILexer {
  _app: IApp;
  _parser: IParser;

  constructor (app: IApp, parser: IParser) {
    this._app = app;
    this._parser = parser;
  }

  exec (code: string): Array<object> {
    if (!code) {
      throw Error('Code is empty.');
    }
    if (typeof code !== 'string') {
      throw Error('Code is not string.');
    }

    return this._generateLexical(code);
  }

  _generateLexical (code: string) {
    const lines = code.split('\n');
    const lexicalGroup: Array<IInstruction> = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!line || !line.trim() || line.startsWith('//')) {
        continue;
      }

      const lexicals = this._parseLine(line);
      if (lexicals) {
        lexicals.forEach(lexical => {
          lexicalGroup.push(lexical);
        });
      }
    }

    return lexicalGroup;
  }

  _parseLine (line: string) {
    const lexicals: Array<IInstruction> = [];
    const commands = this._parser.line(line);

    if (!Array.isArray(commands)) {
      throw Error('"commands" is not array.');
    }

    commands.forEach((command) => {
      const commandParsed = this._parser.command(command);
      if (commandParsed) {
        const lexical = this._newLexical(commandParsed);
        lexicals.push(lexical);
      }
    });

    return lexicals;
  }

  _newLexical (commandParsed: any) {
    return new Instruction({
      name: commandParsed.name,
      element: commandParsed.element,
      key: commandParsed.element ? `${commandParsed.name}${commandParsed.element}` : commandParsed.name,
      type: COMMANDS_MAP[commandParsed.name],
      sound: commandParsed.sound,
      value: commandParsed.value,
      actions: []
    });
  }
}

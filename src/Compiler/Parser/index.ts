import { IApp, IParser } from '../../vite-env';

export default class Parser implements IParser {
  _app: IApp;

  constructor (app: IApp) {
    this._app = app;
  }

  line (line: string): Array<string> {
    if (!line) {
      throw Error('Line is empty.');
    }
    if (typeof line !== 'string') {
      throw Error('Line is not string.');
    }

    const [groupCommands, connect] = line.trim().split('=>').map(value => value.trim());
    const commands = groupCommands.split('.');

    if (!connect) {
      return commands;
    }

    return [...commands, `con(${connect})`];
  }

  command (command: string): undefined | object {
    if (!command) {
      throw Error('Command is empty.');
    }
    if (typeof command !== 'string') {
      throw Error('Command is not string.');
    }
    if (command.startsWith('//') || !command.endsWith(')')) {
      return;
    }

    const [commandId, valueRaw] = command.slice(0, -1).split('(');
    const { name, element } = this._commandId(commandId);
    const value = this._valueRaw(valueRaw);

    return {
      name,
      element,
      value
    };
  }

  _commandId (commandId: string) {
    if (!commandId) {
      throw Error('"commandId" is empty.');
    }

    let name, element, groups;
    const regex = /^([a-z]+)(\d+)?$/g;

    if ((groups = regex.exec(commandId)) !== null) {
      name = groups[1];
      element = groups[2];
    }

    return { name, element };
  }

  _valueRaw (valueRaw: string) {
    if (valueRaw.startsWith('[') && valueRaw.endsWith(']')) {
      const value = valueRaw.replace(/\[|\]/g, '');
      const values = value.trim().split(',');

      return values;
    }

    return valueRaw;
  }
}

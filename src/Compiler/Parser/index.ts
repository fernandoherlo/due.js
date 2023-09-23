import Note from '../../Due/Note';
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
    const commands = groupCommands.split(':');

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

    const [commandIdRaw, valueRaw] = command.slice(0, -1).split('(');

    const [commandId, sound] = commandIdRaw.split('#');

    const { name, element } = this._commandId(commandId);
    const value = this._valueRaw(valueRaw);

    return {
      name,
      element,
      sound,
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
    const [value, duration, interval] = valueRaw.trim().split(';');

    if (value.startsWith('[') && value.endsWith(']')) {
      const valueArray = value.replace(/\[|\]/g, '');
      const values = valueArray.trim().split(',');

      return values.map(v => new Note({
        value: v,
        duration: this._getFloatOrArray(duration),
        interval: this._getFloatOrArray(interval)
      }));
    }

    return new Note({
      value,
      duration: parseFloat(duration),
      interval: parseFloat(interval)
    });
  }

  _getFloatOrArray (valueRaw: string): number | Array<number> {
    if (valueRaw.startsWith('[') && valueRaw.endsWith(']')) {
      const valueArray = valueRaw.replace(/\[|\]/g, '');
      const values = valueArray.trim().split(',');

      return values.map(v => parseFloat(v));
    }
    return parseFloat(valueRaw);
  }
}

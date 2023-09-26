import { IApp, IParser } from '../../vite-env';
import Note from '../../Due/Note';
import { TYPE_VALUE_NOTE } from '../../Due/constants';

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
    const [value, typeValue] = this._valueRaw(valueRaw);

    return {
      name,
      element,
      sound,
      value,
      typeValue
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

    let typeValue = TYPE_VALUE_NOTE.normal;

    if (value && value.startsWith('[') && value.endsWith(']')) {
      const valueArray = value.replace(/\[|\]/g, '');

      let values: any[] = [];
      if (valueArray.includes(',')) {
        typeValue = TYPE_VALUE_NOTE.random;
        values = valueArray.trim().split(',');
      } else if (valueArray.includes('>')) {
        typeValue = TYPE_VALUE_NOTE.sequence;
        values = valueArray.trim().split('>');
      } else if (valueArray.includes('=')) {
        typeValue = TYPE_VALUE_NOTE.chord;
        return [new Note({
          value,
          duration: this._getFloatOrArray(duration),
          interval: this._getFloatOrArray(interval)
        }), typeValue];
      }

      return [values.map(v => new Note({
        value: v,
        duration: this._getFloatOrArray(duration),
        interval: this._getFloatOrArray(interval)
      })), typeValue];
    }

    return [new Note({
      value,
      duration: this._getFloatOrArray(duration),
      interval: this._getFloatOrArray(interval)
    }), typeValue];
  }

  _getFloatOrArray (valueRaw: string): number | Array<number> | any {
    if (valueRaw && valueRaw.startsWith('[') && valueRaw.endsWith(']')) {
      const valueArray = valueRaw.replace(/\[|\]/g, '');

      if (valueArray.includes(',')) {
        const values = valueArray.trim().split(',');
        return values.map(v => parseFloat(v));
      } else if (valueArray.includes('-')) {
        const values = valueArray.trim().split('-');
        return {
          min: values[0],
          max: values[1]
        };
      }
    }
    return parseFloat(valueRaw);
  }
}

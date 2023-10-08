import { IApp, IParser } from '~/src/vite-env';
import { TYPE_VALUE } from '~/src/modules/Compiler/constants';

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

    const [commandId, modifier] = commandIdRaw.split('#');

    const { name, element } = this._commandId(commandId);
    const [value, typeValue] = this._valueRaw(valueRaw, !!element);

    return {
      name,
      element,
      modifier,
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

  _valueRaw (valueRaw: string, defaults: boolean) {
    const [value, value2, value3] = valueRaw.trim().split(';');

    let typeValue = TYPE_VALUE.normal;

    if (value && value.startsWith('[') && value.endsWith(']')) {
      const valueArray = value.replace(/\[|\]/g, '');

      let values: any[] = [];
      if (valueArray.includes(',')) {
        typeValue = TYPE_VALUE.random;
        values = valueArray.trim().split(',');
      } else if (valueArray.includes('>')) {
        typeValue = TYPE_VALUE.sequence;
        values = valueArray.trim().split('>');
      } else if (valueArray.includes('=')) {
        typeValue = TYPE_VALUE.multi;
        return [this._createValue(value, value2, value3, defaults), typeValue];
      }

      return [values.map(v => this._createValue(v, value2, value3, defaults)), typeValue];
    }

    return [this._createValue(value, value2, value3, defaults), typeValue];
  }

  _createValue (value: string | Array<any>, value2: string | undefined, value3: string | undefined, defaults: boolean) {
    const value2Parse = this._calculateValue(value2);
    const value3Parse = this._calculateValue(value3);

    return this._app?.$valueFactory({ value, value2: value2Parse, value3: value3Parse }, defaults);
  }

  _calculateValue (valueRaw: string | undefined): number | Array<number> | any | undefined {
    if (!valueRaw) {
      return;
    }

    if (valueRaw && valueRaw.startsWith('[') && valueRaw.endsWith(']')) {
      const valueArray = valueRaw.replace(/\[|\]/g, '');

      if (valueArray.includes(',')) {
        const values = valueArray.trim().split(',');
        return values.map(v => parseFloat(v));
      } else if (valueArray.includes('-')) {
        const values = valueArray.trim().split('-');
        return {
          min: parseFloat(values[0]),
          max: parseFloat(values[1])
        };
      }
    }
    return parseFloat(valueRaw);
  }
}

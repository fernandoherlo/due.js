import { IApp, IInstruction, IParser } from '~/src/vite-env';
import { COMMANDS, TYPE_VALUE } from '~/src/packages/Compiler/constants';

export default class Parser implements IParser {
  private _app: IApp;

  constructor (app: IApp) {
    this._app = app;
  }

  line (line: string) {
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

  command (command: string): undefined | IInstruction {
    if (!command) {
      throw Error('Command is empty.');
    }
    if (typeof command !== 'string') {
      throw Error('Command is not string.');
    }

    if (command.startsWith(COMMANDS.$$) && command.includes('=')) {
      const [variable, variableValue] = command.split('=');
      const modifier = variable.replace(COMMANDS.$$, '');
      const [commandIdRaw, value] = variableValue.slice(0, -1).split('(');
      const [commandId] = commandIdRaw.split('#');
      const { element = '' } = this._commandId(commandId);

      return {
        name: COMMANDS.$$,
        element,
        key: COMMANDS.$$ + modifier,
        modifier,
        value,
        typeValue: TYPE_VALUE.normal,
        actions: []
      };
    }

    if (command.startsWith(COMMANDS.$) && command.includes('=')) {
      const [variable, variableValue] = command.split('=');
      this._app.$variables[variable] = this._app.$valueFactory && this._app.$valueFactory.adapt(variableValue, this._app.$variables);

      return;
    }

    if (command.startsWith('//') || !command.endsWith(')')) {
      return;
    }

    const [commandIdRaw, valueRaw] = command.slice(0, -1).split('(');

    const [commandId, modifier] = commandIdRaw.split('#');

    const { name = '', element = '' } = this._commandId(commandId);
    const newValueRaw = this._app.$valueFactory && this._app.$valueFactory.adapt(valueRaw, this._app.$variables);
    const [value, typeValue] = this._valueRaw(newValueRaw, !!element);

    return {
      name,
      element,
      key: modifier,
      modifier,
      value,
      typeValue,
      actions: []
    };
  }

  private _commandId (commandId: string) {
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

  private _valueRaw (valueRaw: string, defaults: boolean) {
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
      } else if (valueArray.includes('|')) {
        typeValue = TYPE_VALUE.multi;
        return [this._createValue(value, value2, value3, defaults), typeValue];
      }

      return [values.map(v => this._createValue(v, value2, value3, defaults)), typeValue];
    }

    return [this._createValue(value, value2, value3, defaults), typeValue];
  }

  private _createValue (value: string | Array<any>, value2: string | undefined, value3: string | undefined, defaults: boolean) {
    const value2Parse = this._calculateValue(value2);
    const value3Parse = this._calculateValue(value3);

    return this._app.$valueFactory && this._app.$valueFactory.create({ value, value2: value2Parse, value3: value3Parse }, defaults);
  }

  private _calculateValue (valueRaw: string | undefined): number | Array<number> | any | undefined {
    if (!valueRaw) {
      return;
    }

    if (valueRaw && valueRaw.startsWith('[') && valueRaw.endsWith(']')) {
      const valueArray = valueRaw.replace(/\[|\]/g, '');

      if (valueArray.includes(',')) {
        const values = valueArray.trim().split(',');
        return values.map(v => v);
      } else if (valueArray.includes('-')) {
        const values = valueArray.trim().split('-');
        return {
          min: values[0],
          max: values[1]
        };
      }
    }
    return valueRaw;
  }
}

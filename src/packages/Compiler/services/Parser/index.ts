import type { IApp, IInstruction, IParser } from '~/src/types';
import { COMMANDS, TYPE_VALUE, COMMANDS_MAP } from '~/src/packages/Compiler/constants';
import Instruction from '~/src/packages/Compiler/services/Instruction';

export default class Parser implements IParser {
  private app: IApp;

  constructor (app: IApp) {
    this.app = app;
  }

  line (line: string): string[] {
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
      const { element = '' } = this.commandId(commandId);

      return new Instruction({
        name: COMMANDS.$$,
        element,
        key: COMMANDS.$$ + modifier,
        modifier,
        value,
        type: COMMANDS_MAP[COMMANDS.$$],
        typeValue: TYPE_VALUE.normal,
        actions: []
      });
    }

    if (command.startsWith(COMMANDS.$) && command.includes('=')) {
      const [variable, variableValue] = command.split('=');
      this.app.$variables[variable] = this.app.$valueFactory && this.app.$valueFactory.adapt(variableValue, this.app.$variables);

      return;
    }

    if (command.startsWith('//') || !command.endsWith(')')) {
      return;
    }

    const [commandIdRaw, valueRaw] = command.slice(0, -1).split('(');

    const [commandId, modifier] = commandIdRaw.split('#');

    const { name = '', element = '' } = this.commandId(commandId);
    const newValueRaw = this.app.$valueFactory && this.app.$valueFactory.adapt(valueRaw, this.app.$variables);
    const [value, typeValue] = this.valueRaw(newValueRaw, !!element);

    return new Instruction({
      name,
      element,
      key: modifier,
      modifier,
      value,
        type: COMMANDS_MAP[name],
      typeValue: String(typeValue),
      actions: []
    });
  }

  private commandId (commandId: string) {
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

  private valueRaw (valueRaw: string, defaults: boolean) {
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
        return [this.createValue(value, value2, value3, defaults), typeValue];
      }

      return [values.map(v => this.createValue(v, value2, value3, defaults)), typeValue];
    }

    return [this.createValue(value, value2, value3, defaults), typeValue];
  }

  private createValue (value: string | Array<any>, value2: string | undefined, value3: string | undefined, defaults: boolean) {
    const value2Parse = this.calculateValue(value2);
    const value3Parse = this.calculateValue(value3);

    return this.app.$valueFactory && this.app.$valueFactory.create({ value, value2: value2Parse, value3: value3Parse }, defaults);
  }

  private calculateValue (valueRaw: string | undefined): number | Array<number> | any | undefined {
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

import type { IApp, IInstruction, IParser } from '~/src/types';
import { COMMANDS, TYPE_VALUE, COMMANDS_MAP } from '~/src/packages/Compiler/constants';
import Instruction from '~/src/packages/Compiler/services/Instruction';
import Value from './value';

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

    const isComment = command.startsWith('//');
    const isLiveVariable = command.startsWith(COMMANDS.$$);
    const isVariable = command.startsWith(COMMANDS.$);
    const hasValue = command.includes('=');
    const isInvalidCommand = !command.endsWith(')');

    if (isComment) {
      return;
    }
    if (hasValue && (isLiveVariable || isVariable)) {
      return this.parseVariable(command, isLiveVariable);
    }
    if (isInvalidCommand) {
      return;
    }

    const [commandIdRaw, valueRaw] = this.getRawValues(command);
    const [commandId, modifier] = this.getIds(commandIdRaw);
    const { name = '', element = '' } = this.commandId(commandId);
    const newValueRaw = this.app.$valueFactory && this.app.$valueFactory.adapt(valueRaw, this.app.$variables);
    const [value, typeValue] = Value.valueRaw(this.app, newValueRaw, !!element);

    return new Instruction({
      name,
      element,
      key: modifier,
      modifier,
      value,
      type: COMMANDS_MAP[name],
      typeValue: String(typeValue)
    });
  }

  private parseVariable (command: string, isLiveVariable: boolean): undefined | IInstruction {
    const [variable, variableValue] = command.split('=');

    if (isLiveVariable) {
      const [commandIdRaw, valueRaw] = this.getRawValues(variableValue);
      const [commandId] = this.getIds(commandIdRaw);
      const modifier = variable.replace(COMMANDS.$$, '');
      const { element = '' } = this.commandId(commandId);

      return new Instruction({
        name: COMMANDS.$$,
        element,
        key: COMMANDS.$$ + modifier,
        modifier,
        value: valueRaw,
        type: COMMANDS_MAP[COMMANDS.$$],
        typeValue: TYPE_VALUE.normal
      });
    }

    this.app.$variables[variable] = this.app.$valueFactory && this.app.$valueFactory.adapt(variableValue, this.app.$variables);
    return;
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

  private getRawValues (command: string) {
    if (!command) {
      throw Error('"command" is empty.');
    }
  
    return command.slice(0, -1).split('(');
  }

  private getIds (rawValue: string) {
    if (!rawValue) {
      throw Error('"rawValue" is empty.');
    }
  
    return rawValue.split('#');
  }
}

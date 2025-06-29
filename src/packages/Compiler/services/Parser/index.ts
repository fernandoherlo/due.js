import type { IApp, IInstruction, IParser, IValueParser } from '~/src/types';
import { COMMANDS, TYPE_VALUE, COMMANDS_MAP, CHARACTERS_INSTRUCTIONS } from '~/src/packages/Compiler/constants';
import Instruction from '~/src/packages/Compiler/services/Instruction';

export default class Parser implements IParser {
  private app: IApp;
  private valueParser: IValueParser;

  constructor (app: IApp, valueParser: IValueParser) {
    this.app = app;
    this.valueParser = valueParser;
  }

  line (line: string): string[] {
    if (!line) {
      throw Error('Line is empty.');
    }
    if (typeof line !== 'string') {
      throw Error('Line is not string.');
    }

    const [groupCommands, connect] = line.trim().split(CHARACTERS_INSTRUCTIONS.CONNECT).map(value => value.trim());
    const commands = groupCommands.split(CHARACTERS_INSTRUCTIONS.CONCATENATE_COMMANDS);

    if (!connect) {
      return commands;
    }

    return [...commands, `${COMMANDS.con}(${connect})`];
  }

  command (command: string): undefined | IInstruction {
    if (!command) {
      throw Error('Command is empty.');
    }
    if (typeof command !== 'string') {
      throw Error('Command is not string.');
    }

    const isComment = command.startsWith(CHARACTERS_INSTRUCTIONS.COMMENT);
    const isLiveVariable = command.startsWith(COMMANDS.$$);
    const isVariable = command.startsWith(COMMANDS.$);
    const hasValue = command.includes(CHARACTERS_INSTRUCTIONS.EQUAL);
    const isInvalidCommand = !command.endsWith(CHARACTERS_INSTRUCTIONS.END_VALUE_COMMAND);

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
    const [value, typeValue] = this.valueParser.exec(newValueRaw, !!element);

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
    const [variable, variableValue] = command.split(CHARACTERS_INSTRUCTIONS.EQUAL);

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
  
    return command.slice(0, -1).split(CHARACTERS_INSTRUCTIONS.INIT_VALUE_COMMAND);
  }

  private getIds (rawValue: string) {
    if (!rawValue) {
      throw Error('"rawValue" is empty.');
    }
  
    return rawValue.split(CHARACTERS_INSTRUCTIONS.IDENTIFIER);
  }
}

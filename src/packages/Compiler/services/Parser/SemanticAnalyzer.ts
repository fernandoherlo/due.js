import type { IValueFactory } from '~/src/types';
import type { IInstruction } from '../../types/IInstruction';
import type { IValueParser } from '../../types/IValueParser';
import type { IAstCommand, IAstProgram, IAstStatement } from '../../types/IAst';
import type { ISemanticAnalyzer, ISemanticResult } from '../../types/ISemanticAnalyzer';
import { COMMANDS, COMMANDS_MAP, TYPE_VALUE } from '~/src/packages/Compiler/constants';
import Instruction from '~/src/packages/Compiler/services/Instruction';

export default class SemanticAnalyzer implements ISemanticAnalyzer {
  private valueFactory: IValueFactory;
  private valueParser: IValueParser;
  private variables: Record<string, string> = {};

  constructor (valueFactory: IValueFactory, valueParser: IValueParser) {
    this.valueFactory = valueFactory;
    this.valueParser = valueParser;
  }

  exec (program: IAstProgram): ISemanticResult {
    this.variables = {};
    const instructions = program.lines.map((line) => {
      const lineInstructions: IInstruction[] = [];
      line.statements.forEach((statement) => {
        const instruction = this.analyze(statement);
        if (instruction) {
          lineInstructions.push(instruction);
        }
      });
      return lineInstructions;
    });

    return { instructions, variables: this.variables };
  }

  private analyze (statement: IAstStatement) {
    if (statement.kind === 'variable') {
      this.variables[statement.name] = this.valueFactory.adapt(statement.rawValue, this.variables);
      return;
    }

    if (statement.kind === 'live-variable') {
      const { command, name } = statement;
      const modifier = name.replace(COMMANDS.$$, '');
      return new Instruction({
        name: COMMANDS.$$,
        element: command.element,
        key: COMMANDS.$$ + modifier,
        modifier,
        value: command.rawValue,
        type: COMMANDS_MAP[COMMANDS.$$],
        typeValue: TYPE_VALUE.normal
      });
    }

    return this.createInstruction(statement);
  }

  private createInstruction (command: IAstCommand) {
    const valueRaw = this.valueFactory.adapt(command.rawValue, this.variables);
    const [value, typeValue] = this.valueParser.exec(valueRaw, !!command.element);

    return new Instruction({
      name: command.name,
      element: command.element,
      key: command.element ? `${command.name}${command.element}` : command.modifier,
      modifier: command.modifier,
      value,
      type: COMMANDS_MAP[command.name],
      typeValue: String(typeValue)
    });
  }
}

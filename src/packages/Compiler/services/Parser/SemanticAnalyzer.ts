import type { IValueFactory } from '~/src/types';
import type { IInstruction } from '../../types/IInstruction';
import type { IValueParser } from '../../types/IValueParser';
import type { IAstProgram, IAstStatement, IAstValueExpression } from '../../types/IAst';
import type { ISemanticAnalyzer, ISemanticResult } from '../../types/ISemanticAnalyzer';
import { COMMANDS, COMMANDS_MAP, TYPE_VALUE } from '~/src/packages/Compiler/constants';
import Instruction from '~/src/packages/Compiler/services/Instruction';
import ValueSyntaxParser from './ValueSyntaxParser';

export default class SemanticAnalyzer implements ISemanticAnalyzer {
  private valueFactory: IValueFactory;
  private valueParser: IValueParser;
  private valueSyntaxParser = new ValueSyntaxParser();
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
      this.variables[statement.name] = this.valueFactory.adapt(statement.value.rawValue, this.variables);
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
        value: command.arguments.rawValue,
        type: COMMANDS_MAP[COMMANDS.$$],
        typeValue: TYPE_VALUE.normal
      });
    }

    if (statement.kind === 'connection') {
      return this.createInstruction(COMMANDS.con, '', undefined, statement.target);
    }

    return this.createInstruction(statement.name, statement.element, statement.modifier, statement.arguments);
  }

  private createInstruction (name: string, element: string, modifier: string | undefined, expression: IAstValueExpression) {
    const valueRaw = this.valueFactory.adapt(expression.rawValue, this.variables);
    const adaptedExpression = valueRaw === expression.rawValue
      ? expression
      : this.valueSyntaxParser.parseExpression(valueRaw, expression.location);
    const [value, typeValue] = this.valueParser.exec(adaptedExpression, !!element);

    return new Instruction({
      name,
      element,
      key: element ? `${name}${element}` : modifier,
      modifier,
      value,
      type: COMMANDS_MAP[name],
      typeValue: String(typeValue)
    });
  }
}

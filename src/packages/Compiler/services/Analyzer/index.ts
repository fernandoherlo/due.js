import { AST_KIND, COMMANDS, COMMANDS_MAP, MODES, TYPE_VALUE, VALUE_OPERATOR } from '~/src/packages/Compiler/constants';
import Instruction from '~/src/packages/Compiler/services/Instruction';
import { parseExpression } from '~/src/packages/Compiler/services/Parser/value';
import type { IAstProgram, IAstStatement, IAstValue, IAstValueExpression } from '~/src/packages/Compiler/types/IAst';
import type { ICompilationPlan } from '~/src/packages/Compiler/types/ICompiler';
import type { IInstruction, IValueFactory } from '~/src/types';

export default class Analyzer {
  private readonly valueFactory: IValueFactory;

  constructor (valueFactory: IValueFactory) {
    this.valueFactory = valueFactory;
  }

  exec (program: IAstProgram): Pick<ICompilationPlan, 'instructions' | 'variables'> {
    const variables: Record<string, string> = {};
    const instructions: Record<string, IInstruction> = {};
    for (const line of program.lines) {
      let instrument: IInstruction | undefined;
      for (const statement of line.statements) {
        const instruction = this.analyzeStatement(statement, variables);
        if (!instruction) continue;
        validateMode(instruction, instrument);
        if (instruction.type && instruction.element) {
          instructions[`${instruction.type}${instruction.element}`] = instruction;
          instrument = instruction;
        } else if (instruction.type && instrument) {
          instrument.actions.push(instruction);
        } else {
          const { location } = statement;
          throw Error(`Line ${location.line}, column ${location.column}: Cannot associate command with an instrument.`);
        }
      }
    }
    const ordered = Object.fromEntries(Object.keys(instructions).sort().map(key => [key, instructions[key]]));
    return { instructions: ordered, variables };
  }

  private analyzeStatement (statement: IAstStatement, variables: Record<string, string>): IInstruction | undefined {
    const { valueFactory } = this;
    if (statement.kind === AST_KIND.variable) {
      variables[statement.name] = valueFactory.adapt(statement.value.rawValue, variables);
      return;
    }
    if (statement.kind === AST_KIND.liveVariable) {
      const { command, name } = statement;
      return new Instruction({
        name: COMMANDS.$$,
        element: command.element,
        key: name,
        modifier: name.slice(COMMANDS.$$.length),
        value: command.arguments.rawValue,
        type: COMMANDS_MAP[COMMANDS.$$],
        typeValue: TYPE_VALUE.normal
      });
    }
    const connection = statement.kind === AST_KIND.connection;
    const name = connection ? COMMANDS.con : statement.name;
    const element = connection ? '' : statement.element;
    const modifier = connection ? undefined : statement.modifier;
    const expression = connection ? statement.target : statement.arguments;
    const rawValue = valueFactory.adapt(expression.rawValue, variables);
    const resolved = rawValue === expression.rawValue ? expression : parseExpression(rawValue, expression.location);
    const mode = !connection && statement.mode;
    return new Instruction({
      name,
      element,
      modifier,
      mode,
      modeParameters: mode ? resolved.values.map(argument => argument.rawValue) : undefined,
      type: COMMANDS_MAP[name],
      ...this.createValue(resolved, element)
    });
  }

  private createValue (expression: IAstValueExpression, element: string) {
    const { valueFactory } = this;
    const [note, duration, interval] = expression.values;
    const parameters = { value2: parameter(duration), value3: parameter(interval) };
    if (note?.kind === AST_KIND.collection) {
      if (note.operator === VALUE_OPERATOR.chord) {
        return {
          value: valueFactory.create({ value: note.rawValue, ...parameters }, !!element), typeValue: TYPE_VALUE.multi
        };
      }
      return {
        value: note.values.map(choice => valueFactory.create({ value: choice.rawValue, ...parameters }, !!element)),
        typeValue: note.operator === VALUE_OPERATOR.single ? TYPE_VALUE.normal : note.operator
      };
    }
    return {
      value: note?.kind === AST_KIND.range
        ? []
        : valueFactory.create({ value: note?.rawValue || '', ...parameters }, !!element),
      typeValue: TYPE_VALUE.normal
    };
  }
}

function validateMode (instruction: IInstruction, instrument: IInstruction | undefined): void {
  if (MODES.includes(instruction.name) && !instruction.mode) {
    throw Error(`Use ::${instruction.name}(...) to configure sample playback.`);
  }
  if (!instruction.mode) return;
  if (!MODES.includes(instruction.name) || instruction.element || instruction.modifier) {
    throw Error(`Unsupported playback mode. Use ::${MODES[0]}(...).`);
  }
  if (instrument?.name !== COMMANDS.sam) {
    throw Error(`::${instruction.name}(...) is only available on sam instruments.`);
  }
  if (instrument.actions.some(action => action.mode)) {
    throw Error('Only one playback mode is allowed per sampler.');
  }
  const { value, typeValue, modeParameters } = instruction;
  if (typeValue !== TYPE_VALUE.normal || !value || Array.isArray(value) ||
    (modeParameters?.length ?? 0) > 1 || value.duration !== undefined || value.interval !== undefined) {
    throw Error(`Playback modes require one scalar argument. Use ::${instruction.name}(value).`);
  }
}

function parameter (node: IAstValue | undefined) {
  if (node?.kind === AST_KIND.range) return { min: node.min, max: node.max };
  if (node?.kind === AST_KIND.collection && node.operator === VALUE_OPERATOR.random) {
    return node.values.map(choice => choice.rawValue);
  }
  return node?.rawValue || undefined;
}

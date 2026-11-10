import { AST_KIND, COMMANDS, COMMANDS_MAP, MODES, TEMPO, TYPE_VALUE, VALUE_OPERATOR } from '~/src/packages/Compiler/constants';
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

  exec (program: IAstProgram): Pick<ICompilationPlan, 'instructions' | 'variables' | 'bpm'> {
    const variables: Record<string, string> = {};
    const instructions: Record<string, IInstruction> = {};
    const bpm = readTempo(program);
    for (const line of program.lines) {
      let instrument: IInstruction | undefined;
      for (const statement of line.statements) {
        if (isTempo(statement)) continue;
        const instruction = this.analyzeStatement(statement, variables, bpm);
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
    return { instructions: ordered, variables, bpm };
  }

  private analyzeStatement (statement: IAstStatement, variables: Record<string, string>, bpm: number): IInstruction | undefined {
    const { valueFactory } = this;
    if (statement.kind === AST_KIND.variable) {
      variables[statement.name] = valueFactory.adapt(statement.value.rawValue, variables);
      assertDefined(variables[statement.name], statement.location);
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
    assertDefined(rawValue, statement.location);
    const resolved = rawValue === expression.rawValue ? expression : parseExpression(rawValue, expression.location);
    const mode = !connection && statement.mode;
    return new Instruction({
      name,
      element,
      modifier,
      mode,
      modeParameters: mode ? resolved.values.map(argument => argument.rawValue) : undefined,
      type: COMMANDS_MAP[name],
      ...this.createValue(resolved, element, bpm)
    });
  }

  private createValue (expression: IAstValueExpression, element: string, bpm: number) {
    const { valueFactory } = this;
    const [note, duration, interval] = expression.values;
    const parameters = { value2: parameter(duration, bpm), value3: parameter(interval, bpm) };
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

function assertDefined (rawValue: string, location: { line: number, column: number }): void {
  const name = /(?<!\$)\$[A-Za-z_]\w*/.exec(rawValue)?.[0];
  if (name) {
    throw Error(`Line ${location.line}, column ${location.column}: Undefined variable "${name}".`);
  }
}

function validateMode (instruction: IInstruction, instrument: IInstruction | undefined): void {
  if (MODES.includes(instruction.name) && !instruction.mode) {
    throw Error(`Use ::${instruction.name}(...) to configure sample playback.`);
  }
  if (!instruction.mode) return;
  if (!MODES.includes(instruction.name) || instruction.element || instruction.modifier) {
    throw Error(`Unsupported playback mode. Use ${MODES.map(mode => `::${mode}(...)`).join(' or ')}.`);
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

function parameter (node: IAstValue | undefined, bpm: number) {
  if (node?.kind === AST_KIND.range) return { min: beatsToSeconds(node.min, bpm), max: beatsToSeconds(node.max, bpm) };
  if (node?.kind === AST_KIND.collection && node.operator === VALUE_OPERATOR.random) {
    return node.values.map(choice => beatsToSeconds(choice.rawValue, bpm));
  }
  if (node?.kind === AST_KIND.collection && node.operator === VALUE_OPERATOR.single && node.values.length === 1) {
    return beatsToSeconds(node.values[0].rawValue, bpm);
  }
  return node?.rawValue ? beatsToSeconds(node.rawValue, bpm) : undefined;
}

function beatsToSeconds (raw: string, bpm: number): string {
  const beats = new RegExp(`^(\\d+(?:\\.\\d+)?)${TEMPO.beatUnit}$`).exec(raw);
  return beats ? String(+(Number(beats[1]) * 60 / bpm).toFixed(6)) : raw;
}

function isTempo (statement: IAstStatement): boolean {
  return statement.kind === AST_KIND.command && statement.name === COMMANDS.bpm;
}

function readTempo (program: IAstProgram): number {
  let bpm: number | undefined;
  for (const line of program.lines) {
    for (const statement of line.statements) {
      if (statement.kind !== AST_KIND.command || statement.name !== COMMANDS.bpm) continue;
      const { location } = statement;
      const where = `Line ${location.line}, column ${location.column}`;
      if (line.statements.length > 1 || statement.mode || statement.element || statement.modifier) {
        throw Error(`${where}: Use ${COMMANDS.bpm}(value) alone on its own line.`);
      }
      if (bpm !== undefined) throw Error(`${where}: Only one ${COMMANDS.bpm}(...) is allowed.`);
      const { values } = statement.arguments;
      const value = values.length === 1 && values[0].rawValue ? Number(values[0].rawValue) : NaN;
      if (!Number.isFinite(value) || value < TEMPO.min || value > TEMPO.max) {
        throw Error(`${where}: ${COMMANDS.bpm} must be a number between ${TEMPO.min} and ${TEMPO.max}.`);
      }
      bpm = value;
    }
  }
  return bpm ?? TEMPO.default;
}

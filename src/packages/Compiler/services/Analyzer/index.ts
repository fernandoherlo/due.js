import { AST_KIND, CHARACTERS_INSTRUCTIONS as CHAR, COMMANDS, COMMANDS_MAP, MODES, OPERATORS, REST_VALUE, TEMPO, TYPE_VALUE, VALUE_OPERATOR } from '~/src/packages/Compiler/constants';
import Instruction from '~/src/packages/Compiler/services/Instruction';
import { parseExpression } from '~/src/packages/Compiler/services/Parser/value';
import type { IAstLiveVariable, IAstProgram, IAstStatement, IAstValue, IAstValueExpression } from '~/src/packages/Compiler/types/IAst';
import type { ILiveVariableConfig } from '~/src/packages/Compiler/types/ILiveVariableConfig';
import type { ICompilationPlan } from '~/src/packages/Compiler/types/ICompiler';
import type { IInstruction, IValueFactory } from '~/src/types';

export default class Analyzer {
  private readonly valueFactory: IValueFactory;

  constructor (valueFactory: IValueFactory) {
    this.valueFactory = valueFactory;
  }

  exec (program: IAstProgram): Pick<ICompilationPlan, 'instructions' | 'variables' | 'bpm'> {
    const variables: Record<string, string> = {};
    const liveVariables = new Map<string, ILiveVariableConfig>();
    const instructions: Record<string, IInstruction> = {};
    const bpm = readTempo(program);
    for (const line of program.lines) {
      let instrument: IInstruction | undefined;
      for (const statement of line.statements) {
        if (isTempo(statement)) continue;
        const liveVariableConfig = statement.kind === AST_KIND.liveVariable
          ? parseLiveVariableSource(statement)
          : undefined;
        const instruction = this.analyzeStatement(statement, variables, bpm, liveVariables, liveVariableConfig);
        if (!instruction) continue;
        validateMode(instruction, instrument);
        if (instruction.type && instruction.element) {
          const key = instruction.name === COMMANDS.$$ ? instruction.key : `${instruction.type}${instruction.element}`;
          instructions[key] = instruction;
          instrument = instruction;
        } else if (instruction.name === COMMANDS.con && instrument) {
          instrument.actions.push(instruction);
          if (String(instruction.value.value).startsWith(CHAR.BUS_PREFIX)) {
            instrument.targetBus = String(instruction.value.value).slice(CHAR.BUS_PREFIX.length);
          }
        } else if (instruction.type && instrument) {
          instrument.actions.push(instruction);
        } else {
          const { location } = statement;
          throw Error(`Line ${location.line}, column ${location.column}: Cannot associate command with an instrument.`);
        }
        if (statement.kind === AST_KIND.liveVariable && liveVariableConfig) {
          liveVariables.set(statement.name, liveVariableConfig);
        }
      }
    }
    const ordered = Object.fromEntries(Object.keys(instructions).sort().map(key => [key, instructions[key]]));
    return { instructions: ordered, variables, bpm };
  }

  private analyzeStatement (
    statement: IAstStatement,
    variables: Record<string, string>,
    bpm: number,
    liveVariables: Map<string, ILiveVariableConfig>,
    liveVariableConfig?: ILiveVariableConfig
  ): IInstruction | undefined {
    const { valueFactory } = this;
    if (statement.kind === AST_KIND.variable) {
      variables[statement.name] = valueFactory.adapt(statement.value.rawValue, variables);
      assertDefined(variables[statement.name], statement.location, variables, liveVariables);
      return;
    }
    if (statement.kind === AST_KIND.liveVariable) {
      const { command, name } = statement;
      return new Instruction({
        name: COMMANDS.$$,
        element: command.element,
        key: name,
        modifier: name.slice(COMMANDS.$$.length),
        value: liveVariableConfig,
        type: COMMANDS_MAP[COMMANDS.$$],
        typeValue: TYPE_VALUE.normal
      });
    }
    const connection = statement.kind === AST_KIND.connection;
    const name = connection ? COMMANDS.con : statement.name;
    const element = connection ? '' : statement.element;
    const modifier = connection ? undefined : statement.modifier;
    const expression = connection ? statement.target : statement.arguments;
    if (connection) {
      const target = expression.rawValue.trim();
      return new Instruction({ name, element, modifier, type: COMMANDS_MAP[name], value: { value: target }, typeValue: TYPE_VALUE.normal });
    }
    const rawValue = valueFactory.adapt(expression.rawValue, variables);
    assertDefined(rawValue, statement.location, variables, liveVariables);
    const resolved = rawValue === expression.rawValue ? expression : parseExpression(rawValue, expression.location);
    const mode = !connection && statement.mode;
    validateLiveVariableUsage(name, mode, resolved, liveVariables, statement.location);
    return new Instruction({
      name,
      element,
      modifier,
      mode,
      modeParameters: mode ? resolved.values.map(argument => argument.rawValue) : undefined,
      type: COMMANDS_MAP[name],
      ...this.createValue(resolved, element, bpm, name)
    });
  }

  private createValue (expression: IAstValueExpression, element: string, bpm: number, command: string) {
    const { valueFactory } = this;
    const [note, duration, interval] = expression.values;
    if (containsRest(duration) || containsRest(interval)) {
      throw Error(`The rest value "${REST_VALUE}" is only allowed as a note.`);
    }
    if (containsWeight(duration) || containsWeight(interval)) {
      throw Error('Weights are only allowed on random note choices.');
    }
    if (note && containsRest(note)) {
      if (command !== COMMANDS.n && command !== COMMANDS.sam) {
        throw Error(`The rest value "${REST_VALUE}" is only supported in n or sam note patterns.`);
      }
      if (note.kind === AST_KIND.collection && note.operator === VALUE_OPERATOR.chord) {
        throw Error(`The rest value "${REST_VALUE}" cannot be part of a chord.`);
      }
    }
    const hasWeights = note ? containsWeight(note) : false;
    if (hasWeights && (note?.kind !== AST_KIND.collection || note.operator !== VALUE_OPERATOR.random)) {
      throw Error('Weights are only allowed in random choices separated by commas.');
    }
    if (hasWeights && command !== COMMANDS.n && command !== COMMANDS.sam && command !== COMMANDS.mo) {
      throw Error('Weighted note choices are only supported in n, sam or mo patterns.');
    }
    const parameters = { value2: parameter(duration, bpm), value3: parameter(interval, bpm) };
    if (note?.kind === AST_KIND.collection) {
      if (note.operator === VALUE_OPERATOR.chord) {
        return {
          value: valueFactory.create({ value: note.rawValue, ...parameters }, !!element), typeValue: TYPE_VALUE.multi
        };
      }
      const choices: Array<{ value: string, weight?: number }> = note.operator === VALUE_OPERATOR.random
        ? note.values.map(parseWeightedChoice)
        : note.values.map(choice => ({ value: choice.rawValue }));
      const totalWeight = choices.reduce((sum, choice) => sum + (choice.weight ?? 1), 0);
      if (note.operator === VALUE_OPERATOR.random && (!Number.isFinite(totalWeight) || totalWeight <= 0)) {
        throw Error('At least one weight must be greater than 0.');
      }
      return {
        value: choices.map(choice => valueFactory.create({ ...choice, ...parameters }, !!element)),
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

function containsRest (value: IAstValue | undefined): boolean {
  if (!value) return false;
  if (value.kind === AST_KIND.scalar) return value.rawValue === REST_VALUE;
  if (value.kind === AST_KIND.range) return value.min === REST_VALUE || value.max === REST_VALUE;
  return value.kind === AST_KIND.collection && value.values.some(containsRest);
}

function containsWeight (value: IAstValue | undefined): boolean {
  if (!value) return false;
  if (value.kind === AST_KIND.collection) return value.values.some(containsWeight);
  if (value.kind === AST_KIND.range) return value.min.includes('^') || value.max.includes('^');
  return value.rawValue.includes('^');
}

function parseWeightedChoice (choice: IAstValue): { value: string, weight?: number } {
  if (!choice.rawValue.includes('^')) return { value: choice.rawValue };

  const separator = choice.rawValue.lastIndexOf('^');
  const value = choice.rawValue.slice(0, separator);
  const rawWeight = choice.rawValue.slice(separator + 1);
  if (!value || value.includes('^') || !/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(rawWeight)) {
    throw Error('Weight must be a non-negative number after "^".');
  }

  const weight = Number(rawWeight);
  if (!Number.isFinite(weight)) throw Error('Weight must be a non-negative number after "^".');
  return { value, weight };
}

function assertDefined (
  rawValue: string,
  location: { line: number, column: number },
  variables: Record<string, string>,
  liveVariables: Map<string, ILiveVariableConfig>
): void {
  const references = rawValue.match(/\$\$?[A-Za-z_]\w*/g) ?? [];
  for (const name of references) {
    const defined = name.startsWith(COMMANDS.$$)
      ? liveVariables.has(name)
      : Object.prototype.hasOwnProperty.call(variables, name);
    if (!defined) {
      const label = name.startsWith(COMMANDS.$$) ? 'live variable' : 'variable';
      throw Error(`Line ${location.line}, column ${location.column}: Undefined ${label} "${name}".`);
    }
  }
}

function parseLiveVariableSource (statement: IAstLiveVariable): ILiveVariableConfig {
  const { command, location, name } = statement;
  const where = `Line ${location.line}, column ${location.column}`;
  if (!/^\$\$[A-Za-z_]\w*$/.test(name)) {
    throw Error(`${where}: Live variable names must start with $$ and contain a name.`);
  }
  if (command.name !== COMMANDS.mi || !command.element) {
    throw Error(`${where}: Live variables currently require a MIDI source in the form miN(channel@controller).`);
  }
  if (command.modifier || command.arguments.values.length < 1 || command.arguments.values.length > 2) {
    throw Error(`${where}: A MIDI live variable must use channel@controller and an optional [min-max] range.`);
  }

  const source = /^(\d+)(?:@(\d+))?$/.exec(command.arguments.values[0].rawValue);
  if (!source) {
    throw Error(`${where}: MIDI source must use channel or channel@controller.`);
  }
  const channel = Number(source[1]);
  if (!Number.isInteger(channel) || channel < 1 || channel > 16) {
    throw Error(`${where}: MIDI channel must be between 1 and 16.`);
  }
  if (source[2] !== undefined) {
    const controller = Number(source[2]);
    if (!Number.isInteger(controller) || controller < 0 || controller > 127) {
      throw Error(`${where}: MIDI controller must be between 0 and 127.`);
    }
  }

  let range: ILiveVariableConfig['range'];
  const rangeValue = command.arguments.values[1];
  if (rangeValue) {
    if (rangeValue.kind !== AST_KIND.range) {
      throw Error(`${where}: Live variable range must use [min-max].`);
    }
    const min = Number(rangeValue.min);
    const max = Number(rangeValue.max);
    if (!Number.isFinite(min) || !Number.isFinite(max) || max <= min) {
      throw Error(`${where}: Live variable range must contain finite values with max greater than min.`);
    }
    range = { min, max };
  }

  return {
    channel,
    controller: source[2] === undefined ? undefined : Number(source[2]),
    range
  };
}

function validateLiveVariableUsage (
  command: string,
  mode: boolean | undefined,
  expression: IAstValueExpression,
  liveVariables: Map<string, ILiveVariableConfig>,
  location: { line: number, column: number }
): void {
  const liveReference = /^\$\$[A-Za-z_]\w*$/;
  const liveIndexes = expression.values
    .map((value, index) => value.kind === AST_KIND.reference && liveReference.test(value.rawValue) ? index : -1)
    .filter(index => index >= 0);
  if (!expression.rawValue.includes(COMMANDS.$$)) return;

  const supportedEffects = [COMMANDS.v, COMMANDS.r, COMMANDS.d, COMMANDS.cho];
  const supported = !mode && supportedEffects.includes(command) && liveIndexes.length === 1 && liveIndexes[0] === 0;
  if (!supported) {
    throw Error(`Line ${location.line}, column ${location.column}: Live variables are currently supported only in effect values.`);
  }

  const effectRanges: Partial<Record<string, { min: number, max: number }>> = {
    [COMMANDS.r]: { min: 0, max: 20 },
    [COMMANDS.d]: { min: 0, max: 3 },
    [COMMANDS.cho]: { min: 0, max: 30 }
  };
  const limit = effectRanges[command];
  const range = liveVariables.get(expression.values[liveIndexes[0]].rawValue)?.range;
  if (limit && range && (range.min < limit.min || range.max > limit.max)) {
    throw Error(`Line ${location.line}, column ${location.column}: Live variable range for ${command} must be between ${limit.min} and ${limit.max}.`);
  }
}

function validateMode (instruction: IInstruction, instrument: IInstruction | undefined): void {
  const operator = OPERATORS.includes(instruction.name);
  const known = operator || MODES.includes(instruction.name);
  if (known && !instruction.mode) {
    throw Error(`Use ::${instruction.name}(...) to configure ${operator ? 'note operators' : 'sample playback'}.`);
  }
  if (!instruction.mode) return;
  if (!known || instruction.element || instruction.modifier) {
    throw Error(`Unsupported playback mode. Use ${[...MODES, ...OPERATORS].map(mode => `::${mode}(...)`).join(' or ')}.`);
  }
  if (operator) {
    if (instruction.name === COMMANDS.detune && instrument?.name !== COMMANDS.n) {
      throw Error(`::${instruction.name}(...) is only available on n instruments.`);
    }
    if (instrument?.name !== COMMANDS.n && instrument?.name !== COMMANDS.sam) {
      throw Error(`::${instruction.name}(...) is only available on n or sam instruments.`);
    }
    return;
  }
  if (instrument?.name !== COMMANDS.sam) {
    throw Error(`::${instruction.name}(...) is only available on sam instruments.`);
  }
  if (instrument.actions.some(action => action.mode && MODES.includes(action.name))) {
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

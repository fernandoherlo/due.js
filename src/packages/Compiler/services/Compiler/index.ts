import { IApp, ILexer, IInterpreter, ICompiler, IInstruction } from '~/src/vite-env';
import { compareInstructions } from '../Instruction/compare';

export default class Compiler implements ICompiler {
  private _app: IApp;
  private _lexer: ILexer;
  private _interpreter: IInterpreter;

  private _lastInstructions: any;

  constructor (app: IApp, lexer: ILexer, interpreter: IInterpreter) {
    this._app = app;
    this._lexer = lexer;
    this._interpreter = interpreter;

    this._lastInstructions = {};
  }

  exec (code: string) {
    this._app.$logger.log(code);

    this._resetVariables();

    const lexical: IInstruction[] = this._lexer.exec(code);
    const instructions: IInstruction[] = this._interpreter.exec(lexical);
    const calculatedInstructions: Array<IInstruction[]> = this._calculateInstructions(instructions);

    this._lastInstructions = instructions;
    return [instructions, ...calculatedInstructions];
  }

  private _resetVariables (): void {
    this._app.$variables = {};
  }

  private _calculateInstructions (instructions: IInstruction[]): Array<IInstruction[]> {
    const addedInstructions: IInstruction[] = [];
    const updatedInstructions: IInstruction[] = [];
    const deletedInstructions: IInstruction[] = [];

    for (const key in instructions) {
      if (instructions[key] && this._lastInstructions) {
        if (!Object.keys(this._lastInstructions).includes(key)) {
          addedInstructions.push(instructions[key]);
        } else {
          if (compareInstructions(instructions[key], this._lastInstructions[key])) {
            updatedInstructions.push(instructions[key]);
          }
        }
      }
    }

    for (const key in this._lastInstructions) {
      if (this._lastInstructions[key] && instructions && !Object.keys(instructions).includes(key)) {
        deletedInstructions.push(this._lastInstructions[key]);
      }
    }

    return [addedInstructions, updatedInstructions, deletedInstructions];
  }
}

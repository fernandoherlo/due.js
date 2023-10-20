import { IApp, ILexer, IInterpreter, ICompiler, IInstruction } from '~/src/vite-env';
import { compareInstructions } from '../Instruction/compare';

export default class Compiler implements ICompiler {
  _app: IApp;
  _lexer: ILexer;
  _interpreter: IInterpreter;

  _lastInstructions: any;

  constructor (app: IApp, lexer: ILexer, interpreter: IInterpreter) {
    this._app = app;
    this._lexer = lexer;
    this._interpreter = interpreter;

    this._lastInstructions = {};
  }

  exec (code: string) {
    this._app.$logger.log(code);

    this._resetVariables();

    const lexical: Array<IInstruction> = this._lexer.exec(code);
    const instructions = this._interpreter.exec(lexical);
    const calculatedInstructions: Array<Array<IInstruction>> = this._calculateInstructions(instructions);

    this._lastInstructions = instructions;
    return [instructions, ...calculatedInstructions];
  }

  _resetVariables () {
    this._app.$variables = {};
  }

  _calculateInstructions (instructions: any) {
    const addedInstructions: Array<IInstruction> = [];
    const updatedInstructions: Array<IInstruction> = [];
    const deletedInstructions: Array<IInstruction> = [];

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

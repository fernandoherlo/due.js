import type { IApp, ILexer, IInterpreter, ICompiler, IInstruction } from '~/src/types';
import { areDifferentInstructions } from '../Instruction/compare';

export default class Compiler implements ICompiler {
  private app: IApp;
  private lexer: ILexer;
  private interpreter: IInterpreter;

  private lastInstructions: any;

  constructor (app: IApp, lexer: ILexer, interpreter: IInterpreter) {
    this.app = app;
    this.lexer = lexer;
    this.interpreter = interpreter;

    this.lastInstructions = {};
  }

  exec (code: string) {
    this.app.$logger.log(code);

    this.resetVariables();

    const lexical: IInstruction[] = this.lexer.exec(code);
    const instructions: IInstruction[] = this.interpreter.exec(lexical);
    const calculatedInstructions: Array<IInstruction[]> = this.calculateInstructions(instructions);

    this.lastInstructions = instructions;
    return [instructions, ...calculatedInstructions];
  }

  private resetVariables (): void {
    this.app.$variables = {};
  }

  private calculateInstructions (instructions: IInstruction[]): Array<IInstruction[]> {
    const addedInstructions: IInstruction[] = [];
    const updatedInstructions: IInstruction[] = [];
    const deletedInstructions: IInstruction[] = [];

    for (const key in instructions) {
      if (instructions[key] && this.lastInstructions) {
        if (!Object.keys(this.lastInstructions).includes(key)) {
          addedInstructions.push(instructions[key]);
        } else {
          if (areDifferentInstructions(instructions[key], this.lastInstructions[key])) {
            updatedInstructions.push(instructions[key]);
          }
        }
      }
    }

    for (const key in this.lastInstructions) {
      if (this.lastInstructions[key] && instructions && !Object.keys(instructions).includes(key)) {
        deletedInstructions.push(this.lastInstructions[key]);
      }
    }

    return [addedInstructions, updatedInstructions, deletedInstructions];
  }
}

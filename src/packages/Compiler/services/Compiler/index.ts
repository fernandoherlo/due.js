import type { IApp, ILexer, IInterpreter, ICompiler, IInstruction } from '~/src/types';
import { areDifferentInstructions } from '../Instruction/compare';

export default class Compiler implements ICompiler {
  private app: IApp;
  private lexer: ILexer;
  private interpreter: IInterpreter;

  private previousInstructions: Record<string, IInstruction>;

  constructor (app: IApp, lexer: ILexer, interpreter: IInterpreter) {
    this.app = app;
    this.lexer = lexer;
    this.interpreter = interpreter;

    this.previousInstructions = {};
  }

  exec (code: string) {
    this.app.$logger.log(code);

    this.resetVariables();

    const lexical: IInstruction[] = this.lexer.exec(code);
    const instructions: Record<string, IInstruction> = this.interpreter.exec(lexical);
    const calculatedInstructions: Record<string, IInstruction[]> = this.calculateInstructions(instructions);

    this.previousInstructions = instructions;

    return calculatedInstructions;
  }

  private resetVariables (): void {
    this.app.$variables = {};
  }

  private calculateInstructions (instructions: Record<string, IInstruction>): Record<string, IInstruction[]> {
    const addedInstructions: IInstruction[] = [];
    const updatedInstructions: IInstruction[] = [];
    const deletedInstructions: IInstruction[] = [];

    for (const key in instructions) {
      if (instructions[key] && this.previousInstructions) {
        if (!Object.keys(this.previousInstructions).includes(key)) {
          addedInstructions.push(instructions[key]);
        } else {
          if (areDifferentInstructions(instructions[key], this.previousInstructions[key])) {
            updatedInstructions.push(instructions[key]);
          }
        }
      }
    }

    for (const key in this.previousInstructions) {
      if (this.previousInstructions[key] && instructions && !Object.keys(instructions).includes(key)) {
        deletedInstructions.push(this.previousInstructions[key]);
      }
    }

    return {
      addedInstructions,
      updatedInstructions,
      deletedInstructions
    };
  }
}

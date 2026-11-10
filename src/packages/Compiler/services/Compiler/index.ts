import type { IApp, ILexer, IInterpreter, ICompiler, IInstruction, IParser } from '~/src/types';
import type { ICompilationPlan } from '../../types/ICompiler';
import type { ISemanticAnalyzer } from '../../types/ISemanticAnalyzer';
import Instruction from '~/src/packages/Compiler/services/Instruction';
import { areDifferentInstructions } from '../Instruction/compare';

export default class Compiler implements ICompiler {
  private app: IApp;
  private lexer: ILexer;
  private parser: IParser;
  private semanticAnalyzer: ISemanticAnalyzer;
  private interpreter: IInterpreter;

  private previousInstructions: Record<string, IInstruction>;

  constructor (app: IApp, lexer: ILexer, parser: IParser, semanticAnalyzer: ISemanticAnalyzer, interpreter: IInterpreter) {
    this.app = app;
    this.lexer = lexer;
    this.parser = parser;
    this.semanticAnalyzer = semanticAnalyzer;
    this.interpreter = interpreter;

    this.previousInstructions = {};
  }

  prepare (code: string): ICompilationPlan {
    this.app.$logger.log(code);

    const sourceLines = this.lexer.exec(code);
    const syntax = this.parser.parse(sourceLines);
    const semantic = this.semanticAnalyzer.exec(syntax);
    const instructions = this.interpreter.exec(semantic.instructions);

    const calculatedInstructions = this.calculateInstructions(instructions);

    return {
      instructions: this.cloneInstructions(instructions),
      variables: semantic.variables,
      ...calculatedInstructions
    };
  }

  commit (plan: ICompilationPlan): void {
    this.previousInstructions = plan.instructions;
    this.app.$variables = plan.variables;
  }

  private cloneInstructions (instructions: Record<string, IInstruction>): Record<string, IInstruction> {
    return Object.keys(instructions).reduce((clones: Record<string, IInstruction>, key) => {
      const instruction = instructions[key];
      clones[key] = new Instruction({
        ...instruction,
        actions: instruction.actions.map(action => new Instruction({ ...action }))
      });
      return clones;
    }, {});
  }

  private calculateInstructions (instructions: Record<string, IInstruction>): Pick<ICompilationPlan, 'addedInstructions' | 'updatedInstructions' | 'deletedInstructions'> {
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

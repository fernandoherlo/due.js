import Analyzer from '~/src/packages/Compiler/services/Analyzer';
import Instruction from '~/src/packages/Compiler/services/Instruction';
import { areDifferentInstructions } from '~/src/packages/Compiler/services/Instruction/compare';
import Parser from '~/src/packages/Compiler/services/Parser';
import type { ICompilationPlan } from '~/src/packages/Compiler/types/ICompiler';
import type { IApp, ICompiler, IInstruction, IValueFactory } from '~/src/types';

export default class Compiler implements ICompiler {
  private readonly parser = new Parser();
  private readonly analyzer: Analyzer;
  private previousInstructions: Record<string, IInstruction> = {};

  constructor (private readonly app: IApp, valueFactory: IValueFactory) {
    this.analyzer = new Analyzer(valueFactory);
  }

  prepare (code: string): ICompilationPlan {
    this.app.$logger.log(code);

    const { instructions, variables, bpm } = this.analyzer.exec(this.parser.parse(code));

    return {
      instructions: this.cloneInstructions(instructions),
      variables,
      bpm,
      ...this.calculateInstructions(instructions)
    };
  }

  commit (plan: ICompilationPlan): void {
    this.previousInstructions = plan.instructions;
    this.app.$variables = plan.variables;
  }

  private cloneInstructions (instructions: Record<string, IInstruction>): Record<string, IInstruction> {
    return Object.fromEntries(Object.entries(instructions).map(([key, instruction]) => [
      key,
      new Instruction({
        ...instruction,
        actions: instruction.actions.map(action => new Instruction({ ...action }))
      })
    ]));
  }

  private calculateInstructions (
    instructions: Record<string, IInstruction>
  ): Pick<ICompilationPlan, 'addedInstructions' | 'updatedInstructions' | 'deletedInstructions'> {
    const entries = Object.entries(instructions);
    return {
      addedInstructions: entries.filter(([key]) => !this.previousInstructions[key]).map(([, instruction]) => instruction),
      updatedInstructions: entries
        .filter(([key, instruction]) => this.previousInstructions[key] &&
          areDifferentInstructions(instruction, this.previousInstructions[key]))
        .map(([, instruction]) => instruction),
      deletedInstructions: Object.entries(this.previousInstructions)
        .filter(([key]) => !instructions[key])
        .map(([, instruction]) => instruction)
    };
  }
}

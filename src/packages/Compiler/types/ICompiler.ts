import type { IInstruction } from '~/src/types';

export interface ICompilationPlan {
  instructions: Record<string, IInstruction>;
  variables: Record<string, string>;
  addedInstructions: IInstruction[];
  updatedInstructions: IInstruction[];
  deletedInstructions: IInstruction[];
}

export interface ICompiler {
  prepare: (code: string) => ICompilationPlan;
  commit: (plan: ICompilationPlan) => void;
}

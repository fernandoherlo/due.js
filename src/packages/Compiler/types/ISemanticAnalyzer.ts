import type { IInstruction } from './IInstruction';
import type { IAstProgram } from './IAst';

export interface ISemanticResult {
  instructions: IInstruction[][];
  variables: Record<string, string>;
}

export interface ISemanticAnalyzer {
  exec: (program: IAstProgram) => ISemanticResult;
}

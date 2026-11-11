import type { IInstruction } from '~/src/types';

export interface INoteEvent {
  notes: string[];
  duration: number;
  time?: number;
  // Single notes the instruction can pick from.
  pool?: string[];
}

export interface IOperator {
  apply: (event: INoteEvent) => INoteEvent;
}

export interface IOperatorClass {
  new (action: IInstruction): IOperator;
}

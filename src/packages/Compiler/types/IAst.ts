import { AST_KIND, VALUE_OPERATOR } from '~/src/packages/Compiler/constants';

export interface ISourceLocation {
  line: number;
  column: number;
}

export type IAstValue = { rawValue: string; location: ISourceLocation } & (
  | { kind: typeof AST_KIND.scalar }
  | { kind: typeof AST_KIND.reference; name: string }
  | {
    kind: typeof AST_KIND.collection;
    operator: typeof VALUE_OPERATOR[keyof typeof VALUE_OPERATOR];
    values: IAstValue[];
  }
  | { kind: typeof AST_KIND.range; min: string; max: string }
);

export interface IAstValueExpression {
  values: IAstValue[];
  rawValue: string;
  location: ISourceLocation;
}

export interface IAstCommand {
  kind: typeof AST_KIND.command;
  name: string;
  mode?: boolean;
  element: string;
  modifier?: string;
  arguments: IAstValueExpression;
  location: ISourceLocation;
}

export interface IAstVariable {
  kind: typeof AST_KIND.variable;
  name: string;
  value: IAstValueExpression;
  location: ISourceLocation;
}

export interface IAstLiveVariable {
  kind: typeof AST_KIND.liveVariable;
  name: string;
  command: IAstCommand;
  location: ISourceLocation;
}

export interface IAstConnection {
  kind: typeof AST_KIND.connection;
  target: IAstValueExpression;
  location: ISourceLocation;
}

export type IAstStatement = IAstCommand | IAstVariable | IAstLiveVariable | IAstConnection;

export interface IAstLine {
  statements: IAstStatement[];
  location: ISourceLocation;
}

export interface IAstProgram {
  lines: IAstLine[];
}

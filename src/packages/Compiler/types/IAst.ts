export interface ISourceLine {
  code: string;
  line: number;
}

export interface ISourceLocation {
  line: number;
  column: number;
}

export type IAstValue =
  | { kind: 'scalar'; rawValue: string; location: ISourceLocation }
  | { kind: 'variable-reference'; name: string; rawValue: string; location: ISourceLocation }
  | { kind: 'collection'; operator: 'random' | 'sequence' | 'chord' | 'single'; values: IAstValue[]; rawValue: string; location: ISourceLocation }
  | { kind: 'range'; min: string; max: string; rawValue: string; location: ISourceLocation };

export interface IAstValueExpression {
  values: IAstValue[];
  rawValue: string;
  location: ISourceLocation;
}

export interface IAstCommand {
  kind: 'command';
  name: string;
  element: string;
  modifier?: string;
  arguments: IAstValueExpression;
  location: ISourceLocation;
}

export interface IAstVariable {
  kind: 'variable';
  name: string;
  value: IAstValueExpression;
  location: ISourceLocation;
}

export interface IAstLiveVariable {
  kind: 'live-variable';
  name: string;
  command: IAstCommand;
  location: ISourceLocation;
}

export interface IAstConnection {
  kind: 'connection';
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

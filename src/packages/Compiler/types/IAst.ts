export interface ISourceLine {
  code: string;
  line: number;
}

export interface ISourceLocation {
  line: number;
  column: number;
}

export interface IAstCommand {
  kind: 'command';
  name: string;
  element: string;
  modifier?: string;
  rawValue: string;
  location: ISourceLocation;
}

export interface IAstVariable {
  kind: 'variable';
  name: string;
  rawValue: string;
  location: ISourceLocation;
}

export interface IAstLiveVariable {
  kind: 'live-variable';
  name: string;
  command: IAstCommand;
  location: ISourceLocation;
}

export type IAstStatement = IAstCommand | IAstVariable | IAstLiveVariable;

export interface IAstLine {
  statements: IAstStatement[];
  location: ISourceLocation;
}

export interface IAstProgram {
  lines: IAstLine[];
}

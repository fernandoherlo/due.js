export interface IEditor {
  create: () => void;
  getCode: () => string | undefined;
  setPatternSource: (source: string) => void;
  setActivePatternStep: (key: string, step: number) => void;
  clearActivePatternStep: (key: string) => void;
  clearActivePatternSteps: () => void;
}

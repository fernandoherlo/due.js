export interface IUi {
  start: () => Promise<void>;

  setOk: () => void;
  setValid: () => void;
  setError: () => void;
  setWaiting: () => void;
  setMidiUnavailable: (reason: string) => void;

  updateLoopTime: (progress: number) => void;
  updatePatternStep: (key: string, step: number, duration: number) => void;
  clearPatternStep: (key: string) => void;
  clearActiveSteps: () => void;
}

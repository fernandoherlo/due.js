export interface IUi {
  start: () => Promise<void>;

  setOk: () => void;
  setValid: () => void;
  setError: () => void;
  setWaiting: () => void;
  setMidiUnavailable: (reason: string) => void;

  updateLoopTime: () => void;
  updateSteps: () => void;
}

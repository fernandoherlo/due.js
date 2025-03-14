export interface IUi {
  start: () => Promise<void>;

  setOk: () => void;
  setValid: () => void;
  setError: () => void;
  setWaiting: () => void;

  updateLoopTime: () => void;
  updateSteps: () => void;
}

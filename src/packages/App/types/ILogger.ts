export interface ILogger {
  log: (messages: any | any[] | string) => void;
  error: (messages: any | any[] | string) => void;
}

import { ILogger, IInstrument } from '~/src/vite-env';

export default class LogInstrument {
  static log ($logger: ILogger, instrument: IInstrument, logNote: any[] | undefined): void {
    $logger.log(
`%c${instrument.name}${instrument.element}#${instrument.key}%c
${logNote}%c
${JSON.stringify(instrument.value)}`
    );
  }
}

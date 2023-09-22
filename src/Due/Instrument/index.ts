import { IInstrument } from '../../vite-env';
import Instruction from '../../Compiler/Instruction';

export default class Instrument extends Instruction implements IInstrument {
  _instrument: any | null = null;
  _canUpdate: boolean = false;

  async start (): Promise<void> {
    return new Promise(function (resolve) {
      setTimeout(resolve, 400);
    });
  }

  async play (): Promise<void> {
    return new Promise(function (resolve) {
      setTimeout(resolve, 100);
    });
  }

  async end (): Promise<void> {
    return new Promise(function (resolve) {
      setTimeout(resolve, 1000);
    });
  }

  async update (newInstrument: IInstrument): Promise<void> {
    if (this._canUpdate) {
      this.value = newInstrument.value;
      await this.start();
    }
  }
}

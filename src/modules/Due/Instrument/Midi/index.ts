import { WebMidi } from 'webmidi';
import { IMidi } from '~/src/vite-env';
import Instrument from '..';

export default class Midi extends Instrument implements IMidi {
  _instrument: any | null = null;
  _canUpdate: boolean = true;

  async start (): Promise<void> {
    await WebMidi.enable();
    WebMidi.outputs.forEach(output => this._app.$logger.log(output.name));

    this._instrument = {
      triggerAttackRelease: (value: any, duration: any) => {
        const output = WebMidi.outputs[parseInt(this.element)];
        const channel = output.channels[parseInt(this.modifier)];
        channel.playNote(value, { duration: duration * 1000 });
      }
    };
    this._instrument.debug = this._app.$debug;

    await super.start();
  }

  async end (): Promise<void> {
    delete this._instrument;
  }
}

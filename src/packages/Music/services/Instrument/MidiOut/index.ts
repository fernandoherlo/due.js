import { WebMidi } from 'webmidi';
import type { IMidiOut, IApp } from '~/src/types';
import Instrument from '..';

export default class MidiOut extends Instrument implements IMidiOut {
  constructor (data: any, app: IApp) {
    super(data, app);

    this.canUpdate = true;
  }

  async start (): Promise<void> {
    WebMidi.outputs.forEach(output => this.app.$logger.log(output.name));

    this.instrument = {
      triggerAttackRelease: (value: any, duration: any) => {
        const output = WebMidi.outputs[parseInt(this.element)];
        const channel = output.channels[parseInt(this.modifier)];
        channel.playNote(value, { duration: duration * 1000 });
      }
    };
    this.instrument.debug = this.app.__debugEnabled;

    await super.start();
  }

  async end (): Promise<void> {
    delete this.instrument;
  }
}

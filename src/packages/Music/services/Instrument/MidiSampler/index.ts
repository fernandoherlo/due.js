import { WebMidi } from 'webmidi';
import type { IInstrument, IMidiSampler } from '~/src/types';
import Sampler from '../Sampler';

export default class MidiSampler extends Sampler implements IMidiSampler {
  private midi: any | null;

  async start (): Promise<void> {
    WebMidi.inputs.forEach(input => this.app.$logger.log(input.name));

    const input = WebMidi.inputs[parseInt(this.element)];
    const channelRaw: any = this.value;
    this.midi = input.channels[parseInt(channelRaw.value)];

    this.midi.addListener('noteon', (e: any) => {
      if (this.instrument) {
        this.instrument.triggerAttack(e.note.identifier);
      }
    });
    this.midi.addListener('noteoff', (e: any) => {
      if (this.instrument) {
        this.instrument.triggerRelease(e.note.identifier);
      }
    });

    await super.start();
  }

  async play (): Promise<void> {}

  async update (newInstrument: IInstrument): Promise<void> {
    if (this.canUpdate) {
      if (
        this.value !== newInstrument.value
      ) {
        await this.end();
        await super.setNewValue(newInstrument);

        await this.start();
      } else {
        await super.update(newInstrument);
      }
    }
  }

  async end (): Promise<void> {
    this.midi.removeListener('noteon');
    this.midi.removeListener('noteoff');

    await super.end();
  }
}

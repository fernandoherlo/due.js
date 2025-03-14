import { WebMidi } from 'webmidi';
import { IInstrument, IMidiSampler } from '~/src/vite-env';
import Sampler from '../Sampler';

export default class MidiSampler extends Sampler implements IMidiSampler {
  private _midi: any | null;

  async start (): Promise<void> {
    WebMidi.inputs.forEach(input => this._app.$logger.log(input.name));

    const input = WebMidi.inputs[parseInt(this.element)];
    const channelRaw: any = this.value;
    this._midi = input.channels[parseInt(channelRaw.value)];

    this._midi.addListener('noteon', (e: any) => {
      if (this._instrument) {
        this._instrument.triggerAttack(e.note.identifier);
      }
    });
    this._midi.addListener('noteoff', (e: any) => {
      if (this._instrument) {
        this._instrument.triggerRelease(e.note.identifier);
      }
    });

    await super.start();
  }

  async play (): Promise<void> {}

  async update (newInstrument: IInstrument): Promise<void> {
    if (this._canUpdate) {
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
    this._midi.removeListener('noteon');
    this._midi.removeListener('noteoff');

    await super.end();
  }
}

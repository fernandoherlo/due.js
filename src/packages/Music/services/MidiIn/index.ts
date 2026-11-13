import type { IApp, IMidiIn } from '~/src/types';
import { WebMidi } from 'webmidi';
import Instruction from '~/src/packages/Compiler/services/Instruction';

export default class MidiIn extends Instruction implements IMidiIn {
  private app: IApp;
  private midi: any | null = null;
  private listener: ((event: any) => void) | undefined;

  constructor (data: any, app: IApp) {
    super(data);

    this.app = app;
  }

  async start (): Promise<void> {
    WebMidi.inputs.forEach(input => this.app.$logger.log(input.name));

    const { channel, controller } = this.value;

    const input = WebMidi.inputs[Number.parseInt(this.element)];
    if (!input) {
      this.app.$logger.log(`MIDI input ${this.element} is not available; ${this.key} will remain inactive.`);
      return;
    }
    if (!input.channels[channel]) {
      throw new Error(`MIDI channel ${channel} is not available on input ${this.element}. Use a channel from 1 to 16.`);
    }
    this.midi = input.channels[channel];

    this.listener = (e: any) => {
      this.app.$debugger.add('MIDI', (e.data || e.note));

      const status = e.data[0];
      const messageChannel = (status & 0x0F) + 1;

      if ((status & 0xF0) !== 0xB0 || messageChannel !== channel) {
        return;
      }
      if (controller !== undefined && e.data[1] !== controller) {
        return;
      }
      this.app.$liveVariableRegistry.publish(this.key, e.data[2]);
    };
    this.midi.addListener('midimessage', this.listener);
  }

  async end (): Promise<void> {
    if (this.midi && this.listener) this.midi.removeListener('midimessage', this.listener);
    this.midi = null;
    this.listener = undefined;
  }

  async update (/* newMidi: IMidiIn */): Promise<void> {
  }
}

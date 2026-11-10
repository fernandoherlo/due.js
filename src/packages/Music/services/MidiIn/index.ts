import type { IApp, IMidiIn } from '~/src/types';
import { WebMidi } from 'webmidi';
import Instruction from '~/src/packages/Compiler/services/Instruction';

export default class MidiIn extends Instruction implements IMidiIn {
  private app: IApp;
  private midi: any | null = null;

  constructor (data: any, app: IApp) {
    super(data);

    this.app = app;
  }

  async start (): Promise<void> {
    WebMidi.inputs.forEach(input => this.app.$logger.log(input.name));

    const [channelRaw, controllerRaw] = this.value.split('@');
    const channel = Number.parseInt(channelRaw);
    const controller = controllerRaw === undefined ? undefined : Number.parseInt(controllerRaw);

    const input = WebMidi.inputs[Number.parseInt(this.element)];
    if (!input) {
      this.app.$logger.log(`MIDI input ${this.element} is not available; ${this.key} will remain inactive.`);
      return;
    }
    if (!input.channels[channel]) {
      throw new Error(`MIDI channel ${channelRaw} is not available on input ${this.element}. Use a channel from 1 to 16.`);
    }
    this.midi = input.channels[channel];

    this.midi.addListener('midimessage', (e: any) => {
      this.app.$debugger.add('MIDI', (e.data || e.note));

      const status = e.data[0];
      const messageChannel = (status & 0x0F) + 1;

      if ((status & 0xF0) !== 0xB0 || messageChannel !== channel) {
        return;
      }
      if (controller !== undefined && e.data[1] !== controller) {
        return;
      }
      if (this.app.$variablesLiveMap[this.key]) {
        this.app.$variablesLiveMap[this.key].update(e.data[2]);
      }
    });
  }

  async end (): Promise<void> {
    this.midi?.removeListener('midimessage');
    this.midi = null;
  }

  async update (/* newMidi: IMidiIn */): Promise<void> {
  }
}

import { WebMidi } from 'webmidi';
import type { IApp, IMidiIn } from '~/src/types';
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

    const [channel, note] = this.value.split('@');

    const input = WebMidi.inputs[parseInt(this.element)];
    this.midi = input.channels[parseInt(channel)];

    this.midi.addListener('midimessage', (e: any) => {
      this.app.$debugger.add('MIDI', (e.data || e.note));

      if (note && e.data[0] === 176 && e.data[1] !== parseInt(note)) {
        return;
      }
      if (this.app.$variablesLiveMap[this.key]) {
        this.app.$variablesLiveMap[this.key].update(e.data[2]);
      }
    });
  }

  async end (): Promise<void> {
    this.midi.removeListener('midimessage');
  }

  async update (/* newMidi: IMidiIn */): Promise<void> {
  }
}

import { WebMidi } from 'webmidi';
import { IApp, IMidiIn } from '~/src/vite-env';
import Instruction from '~/src/packages/Compiler/services/Instruction';

export default class MidiIn extends Instruction implements IMidiIn {
  private _app: IApp;
  private _midi: any | null = null;

  constructor (data: any, app: IApp) {
    super(data);

    this._app = app;
  }

  async start (): Promise<void> {
    WebMidi.inputs.forEach(input => this._app.$logger.log(input.name));

    const [channel, note] = this.value.split('@');

    const input = WebMidi.inputs[parseInt(this.element)];
    this._midi = input.channels[parseInt(channel)];

    this._midi.addListener('midimessage', (e: any) => {
      this._app.$debugger.add('MIDI', (e.data || e.note));

      if (note && e.data[0] === 176 && e.data[1] !== parseInt(note)) {
        return;
      }
      if (this._app.$variablesLiveMap[this.key]) {
        this._app.$variablesLiveMap[this.key].update(e.data[2]);
      }
    });
  }

  async end (): Promise<void> {
    this._midi.removeListener('midimessage');
  }

  async update (/* newMidi: IMidiIn */): Promise<void> {
  }
}

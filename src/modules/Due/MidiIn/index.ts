import { WebMidi } from 'webmidi';
import { IApp, IMidiIn } from '~/src/vite-env';
import Instruction from '../../Compiler/Instruction';

export default class MidiIn extends Instruction implements IMidiIn {
  _instrument: any | null = null;
  _app: IApp;

  constructor (data: any, app: IApp) {
    super(data);

    this._app = app;
  }

  async start (): Promise<void> {
    WebMidi.inputs.forEach(input => this._app.$logger.log(input.name));

    const varElement: any = this.value;
    const input = WebMidi.inputs[parseInt(varElement.element)];
    this._instrument = input.channels[parseInt(this.modifier)];

    this._instrument.addListener('noteon', (e: any) => {
      console.log(e.note);
      this.value = e.note.identifier;
      this._app.$variablesLiveMap[this.key].update(e.note.attack);
    });
  }

  async end (): Promise<void> {
    this._instrument.removeListener('noteon');
  }

  async update (/* newMidi: IMidiIn */): Promise<void> {
  }
}

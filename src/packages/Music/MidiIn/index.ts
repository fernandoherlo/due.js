import { WebMidi } from 'webmidi';
import { IApp, IMidiIn } from '~/src/vite-env';
import Instruction from '../../Compiler/Instruction';

export default class MidiIn extends Instruction implements IMidiIn {
  _app: IApp;
  _midi: any | null = null;

  constructor (data: any, app: IApp) {
    super(data);

    this._app = app;
  }

  async start (): Promise<void> {
    WebMidi.inputs.forEach(input => this._app.$logger.log(input.name));

    const varElement: any = this.value;
    const input = WebMidi.inputs[parseInt(varElement.element)];
    this._midi = input.channels[1];

    // this._midi.addListener('midimessage', (e: any) => {
    //   // TODO: test with arturia minilab 3
    //   console.log(e);
    //   this.value = e.note.identifier;
    //   this._app.$variablesLiveMap[this.key] && this._app.$variablesLiveMap[this.key].update(e.note.attack);
    // });
  }

  async end (): Promise<void> {
    // this._midi.removeListener('midimessage');
  }

  async update (/* newMidi: IMidiIn */): Promise<void> {
  }
}

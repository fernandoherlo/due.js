import * as Tone from 'tone';
import * as mm from '@magenta/music/es6';
import { IMagenta } from '~/src/vite-env';
import { TYPE_VALUE } from '~/src/modules/Compiler/constants';
import Note from '~/src/modules/Due/Note';
import Instrument from '..';

export default class Magenta extends Instrument implements IMagenta {
  _instrument: any | null = null;
  _canUpdate: boolean = true;

  async start (): Promise<void> {
    let connect: any | null = null;
    if (this.actions.length) {
      connect = await this.startActions();
    }

    this.value = await this._getNotes();
    this.typeValue = TYPE_VALUE.sequence;

    this._instrument = new Tone.PolySynth();
    this._instrument.debug = this._app.$debug;

    if (connect) {
      this._instrument.connect(connect._effect);
    } else {
      this._instrument.toDestination();
    }

    await super.start();
  }

  async update (newInstrument: IMagenta): Promise<void> {
    if (this._canUpdate) {
      this.value = newInstrument.value;
      this.value = await this._getNotes();
      this.modifier = newInstrument.modifier;
      await this.play();
    }
  }

  async _getNotes () {
    const model = new mm.MusicVAE('https://storage.googleapis.com/magentadata/js/checkpoints/music_vae/trio_4bar');
    // 'https://storage.googleapis.com/magentadata/js/checkpoints/music_vae/mel_2bar_small'

    await model.initialize();
    const samples = await model.sample(1);
    const notes = samples[0].notes;

    const value: any = this.value;

    const newValue: any = [];
    notes?.forEach((note) => {
      newValue.push(new Note({ value: note.pitch, value2: ((note.quantizedEndStep || 0) - (note.quantizedStartStep || 0)), value3: value.duration }, true));
    });

    return newValue;
  }
}

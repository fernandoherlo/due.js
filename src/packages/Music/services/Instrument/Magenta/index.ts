import type { IInstrument, IMagenta, INote } from '~/src/types';
import type { MusicVAESpec } from '@magenta/music/esm/music_vae/model';
import { TYPE_VALUE } from '~/src/packages/Compiler/constants';
import Note from '../../Note';
import Sampler from '../Sampler';
import TriggerAttack from '../triggerAttack';

export default class Magenta extends Sampler implements IMagenta {
  async start (): Promise<void> {
    this.value = await this._getNotes();
    this.typeValue = TYPE_VALUE.sequence;

    await super.start();
  }

  async setNewValue (newInstrument: IInstrument) {
    super.setNewValue(newInstrument);

    this.value = await this._getNotes();
    this.typeValue = TYPE_VALUE.sequence;
  }

  private async _getNotes (): Promise<INote[]> {
    const VAEspec: MusicVAESpec = {
      type: 'MusicVAE',
      dataConverter: {
        type: 'MelodyConverter',
        args: {
          numSteps: 16,
          minPitch: 21,
          maxPitch: 108,
          ignorePolyphony: true
        }
      },
      useBooleanDecoder: false,
      conditionOnKey: false
    };

    const mm = await import('@magenta/music/es6');
    const model = new mm.MusicVAE('https://storage.googleapis.com/magentadata/js/checkpoints/music_vae/mel_2bar_small', VAEspec);
    // 'https://storage.googleapis.com/magentadata/js/checkpoints/music_vae/trio_4bar'

    await model.initialize();

    const temperature = 0.5;
    const stepsPerQuarter = 2;
    const numSteps = 32;
    const controlArgs = {
      // chordProgression: ['Cmaj7', 'Abdim', 'C#m7'], // Progresión de acordes
      // key: 4 // Tono (0 para C mayor)
      // extraControls: {
      //   // Controles adicionales (por ejemplo, cambiar la velocidad)
      //   tempo: tf.tensor2d([[80]], [1, 1]), // 80 BPM
      // },
    };

    const samples = await model.sample(1, temperature, controlArgs, stepsPerQuarter, numSteps);
    const notes = samples[0].notes;

    await model.dispose();

    const value: any = this.value;
    const newValue: INote[] = [];

    notes?.forEach((note) => {
      newValue.push(new Note({
        value: note.pitch,
        value2: ((note.quantizedEndStep || 0) - (note.quantizedStartStep || 0)),
        value3: TriggerAttack.getValue(value).interval
      }, true));
    });

    return newValue;
  }
}

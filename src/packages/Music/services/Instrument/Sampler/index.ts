import * as Tone from 'tone';
import { areDifferentInstructions } from '~/src/packages/Compiler/services/Instruction/compare';
import { MODES_MAP, SAMPLER_MAP } from '~/src/packages/Music/constants';
import samples from '~/src/packages/Music/constants/samples.json';
import Instrument from '~/src/packages/Music/services/Instrument';
import Mode from '~/src/packages/Music/services/Modes';

import type { IApp, IInstrument, ISampler } from '~/src/types';

export default class Sampler extends Instrument implements ISampler {
  protected instrument: Tone.Sampler | null = null;

  constructor (data: any, app: IApp) {
    super(data, app);

    this.canUpdate = true;
  }

  async start (): Promise<void> {
    let connect: any | null = null;
    if (this.actions.length) {
      connect = await this.startActions();
    }

    const samplesMap: any = samples;
    const sound = this.modifier || 'piano';
    const urls = this.pathUrl(samplesMap[SAMPLER_MAP[sound]], SAMPLER_MAP[sound]);
    const mode = this.actions.find(action => action.mode);
    this.instrument = mode
      ? new MODES_MAP[mode.name](mode, await Mode.loadBuffers(urls))
      : await new Promise<Tone.Sampler>((resolve, reject) => {
        const sampler: Tone.Sampler = new Tone.Sampler({
          urls,
          onload: function onload () {
            return resolve(sampler);
          },
          onerror: reject
        });
      });
    this.instrument.debug = this.app.__debugEnabled;

    if (connect) {
      this.instrument.connect(connect.effect);
    } else {
      this.instrument.toDestination();
    }

    await super.start();
  }

  async update (newInstrument: IInstrument): Promise<void> {
    if (this.canUpdate) {
      await this.setNewValue(newInstrument);

      if (
        this.modifier !== newInstrument.modifier ||
        this.actions.some((action, index) => areDifferentInstructions(newInstrument.actions?.[index], action)) ||
        newInstrument.actions.some((action, index) => areDifferentInstructions(this.actions?.[index], action))
      ) {
        await this.end();

        this.modifier = newInstrument.modifier;
        this.actions = newInstrument.actions;

        await this.start();
      } else {
        await super.start();
      }
    }
  }

  async setNewValue (newInstrument: IInstrument) {
    this.value = newInstrument.value;
    this.typeValue = newInstrument.typeValue;
  }

  private pathUrl (notes: any, sound: string): any {
    const pathNotes: any = {};

    Object.keys(notes).forEach((note) => {
      pathNotes[note] = `samples/${sound}/${notes[note]}`;
    });

    return pathNotes;
  }
}

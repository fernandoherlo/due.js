import * as Tone from 'tone';

import { IApp, IDue, IInstruction } from '../vite-env';
import Proxy from '../Proxy';
import Synth from './Instrument/Synth';

export default class Due extends Proxy implements IDue {
  _instructions: any;

  constructor (app: IApp) {
    super(app);
    this._instructions = {};
  }

  async add (instructions: Array<IInstruction>) {
    super.add(instructions);

    for (let i = 0; i < instructions.length; i++) {
      const instruction: IInstruction = instructions[i];
      if (!this._instructions[instruction.key]) {
        const instrument = new Synth(instruction);
        await instrument.start();

        this._instructions[instruction.key] = instrument;
      }
    }
  }

  async update (instructions: Array<IInstruction>) {
    super.update(instructions);

    for (let i = 0; i < instructions.length; i++) {
      const instruction: IInstruction = instructions[i];
      if (this._instructions[instruction.key]) {
        await this._instructions[instruction.key].update(instruction);
      }
    }
  }

  async delete (instructions: Array<IInstruction>) {
    super.delete(instructions);

    for (let i = 0; i < instructions.length; i++) {
      const instruction: IInstruction = instructions[i];
      if (this._instructions[instruction.key]) {
        await this._instructions[instruction.key].end();

        delete this._instructions[instruction.key];
      }
    }
  }

  test () {
    const synth = new Tone.Synth().toDestination();
    synth.debug = this._debug;
    synth.triggerAttackRelease('C4', '8n');
  }
}

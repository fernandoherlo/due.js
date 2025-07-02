import * as Tone from 'tone';
import { WebMidi } from 'webmidi';

import type { IApp, IMusic, IInstruction, IInstrument } from '~/src/types';
import ValueFactory from '~/src/packages/Music/services/Music/valueFactory';
import { COMMANDS_ELEMENT_MAP, SAMPLER_MAP } from '../../constants';

export default class Music implements IMusic {
  private app: IApp;
  private instructions: any;

  constructor (app: IApp) {
    this.app = app;
    this.instructions = {};

    this.app.$valueFactory = new ValueFactory();
  }

  async start () {
    await WebMidi.enable();

    Tone.getTransport().scheduleRepeat(async (time) => {
      Tone.getDraw().schedule(() => {
        this.app.$ui.updateLoopTime();
      }, time);

      this.app.$ui.updateSteps();
    }, 1);
  }

  async toggle () {
    await Tone.start();
    Tone.getTransport().toggle();
  }

  samples () {
    this.app.$logger.log(SAMPLER_MAP);
  }

  async add (instructions: Array<IInstruction>) {
    if (instructions.length) {
      this.app.$debugger.add('ADD', instructions);
    }

    for (let i = 0; i < instructions.length; i++) {
      const instruction: IInstruction = instructions[i];
      if (!this.instructions[instruction.key]) {
        const element = COMMANDS_ELEMENT_MAP[instruction.name](instruction, this.app) as IInstrument;
        await element.start();

        this.instructions[instruction.key] = element;
      }
    }
  }

  async update (instructions: Array<IInstruction>) {
    if (instructions.length) {
      this.app.$debugger.add('UPDATE', instructions);
    }

    for (let i = 0; i < instructions.length; i++) {
      const instruction: IInstruction = instructions[i];
      if (this.instructions[instruction.key]) {
        await this.instructions[instruction.key].update(instruction);
      }
    }
  }

  async delete (instructions: Array<IInstruction>) {
    if (instructions.length) {
      this.app.$debugger.add('DELETE', instructions);
    }

    for (let i = 0; i < instructions.length; i++) {
      const instruction: IInstruction = instructions[i];
      if (this.instructions[instruction.key]) {
        await this.instructions[instruction.key].end();

        delete this.instructions[instruction.key];
      }
    }
  }
}

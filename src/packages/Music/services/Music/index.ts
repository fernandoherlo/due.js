import * as Tone from 'tone';
import { WebMidi } from 'webmidi';

import { IApp, IMusic, IInstruction } from '~/src/vite-env';
import ValueFactory from '~/src/packages/Music/services/Music/valueFactory';
import { COMMANDS_ELEMENT_MAP, SAMPLER_MAP } from '../../constants';

export default class Music implements IMusic {
  _app: IApp;
  _debug: boolean;
  _instructions: any;

  constructor (app: IApp) {
    this._app = app;
    this._debug = this._app.$debug;
    this._instructions = {};

    this._app.$valueFactory = new ValueFactory();
  }

  async start () {
    await WebMidi.enable();

    Tone.Transport.scheduleRepeat(async (time) => {
      Tone.Draw.schedule(() => {
        this._app.$ui.updateLoopTime();
      }, time);

      this._app.$ui.updateSteps();
    }, 1);
  }

  async toggle () {
    await Tone.start();
    Tone.Transport.toggle();
  }

  samples () {
    this._app.$logger.log(SAMPLER_MAP);
  }

  async add (instructions: Array<IInstruction>) {
    if (instructions.length) {
      this._app.$debugger.add('ADD', instructions);
    }

    for (let i = 0; i < instructions.length; i++) {
      const instruction: IInstruction = instructions[i];
      if (!this._instructions[instruction.key]) {
        const element = COMMANDS_ELEMENT_MAP[instruction.name](instruction, this._app);
        await element.start();

        this._instructions[instruction.key] = element;
      }
    }
  }

  async update (instructions: Array<IInstruction>) {
    if (instructions.length) {
      this._app.$debugger.add('UPDATE', instructions);
    }

    for (let i = 0; i < instructions.length; i++) {
      const instruction: IInstruction = instructions[i];
      if (this._instructions[instruction.key]) {
        await this._instructions[instruction.key].update(instruction);
      }
    }
  }

  async delete (instructions: Array<IInstruction>) {
    if (instructions.length) {
      this._app.$debugger.add('DELETE', instructions);
    }

    for (let i = 0; i < instructions.length; i++) {
      const instruction: IInstruction = instructions[i];
      if (this._instructions[instruction.key]) {
        await this._instructions[instruction.key].end();

        delete this._instructions[instruction.key];
      }
    }
  }
}

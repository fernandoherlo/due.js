import { stringify } from 'flatted';
import { IApp, IMusic, IInstruction } from '~/src/vite-env';
import { COMMANDS_ELEMENT_MAP, SAMPLER_MAP } from './constants';
import NoteFactory from '~/src/modules/Music/Note/factory';

export default class Music implements IMusic {
  _app: IApp;
  _debug: boolean;
  _instructions: any;

  constructor (app: IApp) {
    this._app = app;
    this._debug = this._app.$debug;
    this._instructions = {};

    this._app.$valueFactory = NoteFactory;
  }

  samples () {
    this._app.$logger.log(SAMPLER_MAP);
  }

  async add (instructions: Array<IInstruction>) {
    if (instructions.length) {
      this._app.$debugger.add('ADD', stringify(instructions, null, 2));
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
      this._app.$debugger.add('UPDATE', stringify(instructions, null, 2));
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
      this._app.$debugger.add('DELETE', stringify(instructions, null, 2));
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

import { IApp, IDue, IInstruction } from '~/src/vite-env';
import { COMMANDS_ELEMENT_MAP, SAMPLER_MAP } from './constants';
import Proxy from '~/src/modules/Proxy';
import NoteFactory from '~/src/modules/Due/Note/factory';

export default class Due extends Proxy implements IDue {
  _instructions: any;

  constructor (app: IApp) {
    super(app);
    this._instructions = {};
  }

  linkToApp () {
    super.linkToApp();

    this._app.$valueFactory = NoteFactory;
  }

  samples () {
    this._app.$logger.log(SAMPLER_MAP);
  }

  async add (instructions: Array<IInstruction>) {
    super.add(instructions);

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
}

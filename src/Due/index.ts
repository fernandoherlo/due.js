import { IApp, IDue, IInstruction } from '../vite-env';
import Proxy from '../Proxy';
import { COMMANDS_INSTRUMENT_MAP } from './constants';

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
        const instrument = COMMANDS_INSTRUMENT_MAP[instruction.name](instruction, this._app);
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
}

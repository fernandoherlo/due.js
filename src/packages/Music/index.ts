import { stringify } from 'flatted';

import * as Tone from 'tone';
import { WebMidi } from 'webmidi';

import { IApp, IMusic, IInstruction } from '~/src/vite-env';
import { COMMANDS_ELEMENT_MAP, SAMPLER_MAP } from './constants';
import NoteFactory from '~/src/packages/Music/Note/factory';
import { compareInstructions } from '~/src/packages/Compiler/Instruction/compare';

export default class Music implements IMusic {
  _app: IApp;
  _debug: boolean;
  _instructions: any;
  _lastInstructions: any;

  constructor (app: IApp) {
    this._app = app;
    this._debug = this._app.$debug;
    this._instructions = {};

    this._app.$valueFactory = NoteFactory;
    this._lastInstructions = {};
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

  async process (instructions: Array<IInstruction>) {
    const newInstructions: Array<IInstruction> = this._getNewInstructions(instructions);
    const updateInstructions: Array<IInstruction> = this._getUpdateInstructions(instructions);
    const oldInstructions: Array<IInstruction> = this._getOldInstructions(instructions);

    await this._add(newInstructions);
    await this._update(updateInstructions);
    await this._delete(oldInstructions);

    this._lastInstructions = instructions;
  }

  samples () {
    this._app.$logger.log(SAMPLER_MAP);
  }

  _getNewInstructions (instructions: any) {
    const newInstructions: Array<IInstruction> = [];

    for (const key in instructions) {
      if (instructions[key] && this._lastInstructions && !Object.keys(this._lastInstructions).includes(key)) {
        newInstructions.push(instructions[key]);
      }
    }

    return newInstructions;
  }

  _getUpdateInstructions (instructions: any) {
    const updateInstructions: Array<IInstruction> = [];

    for (const key in instructions) {
      if (instructions[key] && this._lastInstructions && Object.keys(this._lastInstructions).includes(key)) {
        if (compareInstructions(instructions[key], this._lastInstructions[key])) {
          updateInstructions.push(instructions[key]);
        }
      }
    }

    return updateInstructions;
  }

  _getOldInstructions (instructions: any) {
    const oldInstructions: Array<IInstruction> = [];

    for (const key in this._lastInstructions) {
      if (this._lastInstructions[key] && instructions && !Object.keys(instructions).includes(key)) {
        oldInstructions.push(this._lastInstructions[key]);
      }
    }

    return oldInstructions;
  }

  async _add (instructions: Array<IInstruction>) {
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

  async _update (instructions: Array<IInstruction>) {
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

  async _delete (instructions: Array<IInstruction>) {
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

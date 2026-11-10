import * as Tone from 'tone';
import { WebMidi } from 'webmidi';

import { COMMANDS } from '~/src/packages/Compiler/constants';
import { COMMANDS_ELEMENT_MAP } from '~/src/packages/Music/constants';
import { MODES_MAP } from '~/src/packages/Music/constants/modes';
import { SAMPLER_MAP } from '~/src/packages/Music/constants/samplers';
import validateInstruction from '~/src/packages/Music/helpers/validateInstruction';
import type { IApp, IInstruction, IInstrument, IMusic } from '~/src/types';

export default class Music implements IMusic {
  private app: IApp;
  private instructions: any;

  constructor (app: IApp) {
    this.app = app;
    this.instructions = {};
  }

  async start () {
    try {
      await WebMidi.enable();
    } catch (error) {
      const reason = error instanceof Error ? error.message : 'MIDI could not be enabled.';
      this.app.$logger.log(['MIDI unavailable:', error]);
      this.app.$ui.setMidiUnavailable(reason);
    }

    Tone.getTransport().scheduleRepeat(async (time) => {
      Tone.getDraw().schedule(() => {
        this.app.$ui.updateLoopTime();
      }, time);

      this.app.$ui.updateSteps();
    }, 1);

    Tone.getTransport().bpm.value = 120; // Tempo is applied by the compiler: beats are converted to seconds.
  }

  async toggle () {
    await Tone.start();
    Tone.getTransport().toggle();
  }

  samples () {
    this.app.$logger.log(SAMPLER_MAP);
  }

  validate (instructions: Array<IInstruction>): void {
    for (const instruction of instructions) {
      const commands = [instruction, ...instruction.actions];

      for (const command of commands) {
        if (command.mode) {
          MODES_MAP[command.name].parse(command);
          continue;
        }
        if (!COMMANDS_ELEMENT_MAP[command.name]) {
          throw Error(`Unsupported command "${command.name}".`);
        }
        validateInstruction(command);
      }

      if (instruction.name === COMMANDS.sam && instruction.modifier && !SAMPLER_MAP[instruction.modifier]) {
        throw Error(`Unknown sample preset "${instruction.modifier}".`);
      }
    }
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

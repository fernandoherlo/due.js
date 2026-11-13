import * as Tone from 'tone';
import { WebMidi } from 'webmidi';

import { COMMANDS, OPERATORS } from '~/src/packages/Compiler/constants';
import { COMMANDS_ELEMENT_MAP } from '~/src/packages/Music/constants';
import { MODES_MAP } from '~/src/packages/Music/constants/modes';
import { SAMPLER_MAP } from '~/src/packages/Music/constants/samplers';
import { isSynthPreset } from '~/src/packages/Music/constants/synths';
import validateInstruction from '~/src/packages/Music/helpers/validateInstruction';
import { createOperator } from '~/src/packages/Music/helpers/createOperators';
import type { IApp, IBus, IInstruction, IInstrument, IMusic } from '~/src/types';

const BEATS_PER_BAR = 4;

export default class Music implements IMusic {
  private app: IApp;
  private instructions: Record<string, IInstrument>;
  private muted: Set<string> = new Set();
  private progressEventId: number | undefined;
  private progressStep = 0;
  private progressTempo: number | undefined;
  private buses = new Map<string, IBus>();

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

    Tone.getTransport().bpm.value = 120; // Note intervals are compiled to seconds.
    this.setTempo(120);
  }

  async toggle () {
    await Tone.start();
    Tone.getTransport().toggle();
    this.app.$ui.clearActiveSteps();
  }

  setTempo (bpm: number): void {
    if (this.progressTempo === bpm && this.progressEventId !== undefined) return;
    const transport = Tone.getTransport();
    if (this.progressEventId !== undefined) transport.clear(this.progressEventId);
    this.progressTempo = bpm;
    this.progressStep = 0;
    this.progressEventId = transport.scheduleRepeat((time) => {
      this.progressStep = this.progressStep === BEATS_PER_BAR ? 1 : this.progressStep + 1;
      const progress = (this.progressStep * 100) / BEATS_PER_BAR;
      Tone.getDraw().schedule(() => this.app.$ui.updateLoopTime(progress), time);
    }, 60 / bpm, transport.seconds ?? 0);
  }

  async waitForNextBar (bpm: number): Promise<void> {
    const transport = Tone.getTransport();
    if (transport.state !== 'started') return;

    const bar = (BEATS_PER_BAR * 60) / bpm;
    const next = (Math.floor(transport.seconds / bar) + 1) * bar;
    await new Promise<void>((resolve) => {
      let id = 0;
      const finish = () => {
        transport.clear(id);
        transport.off('stop', finish);
        transport.off('pause', finish);
        resolve();
      };
      id = transport.scheduleOnce(finish, next);
      // Sin transporte en marcha el compas no llega; no bloquear la compilacion.
      transport.once('stop', finish);
      transport.once('pause', finish);
    });
  }

  toggleMute (key: string): boolean {
    const muted = !this.muted.has(key);
    if (muted) {
      this.muted.add(key);
    } else {
      this.muted.delete(key);
    }
    this.instructions[key]?.setMuted?.(muted);
    if (muted) this.app.$ui.clearPatternStep(key);
    return muted;
  }

  isMuted (key: string): boolean {
    return this.muted.has(key);
  }

  getBus (name: string): Tone.Gain {
    const bus = this.buses.get(name);
    if (!bus) throw Error(`Unknown bus "${name}".`);
    return bus.output;
  }

  samples () {
    this.app.$logger.log(SAMPLER_MAP);
  }

  validate (instructions: Array<IInstruction>): void {
    const declaredBuses = new Set(instructions.filter(instruction => instruction.name === COMMANDS.bus).map(instruction => instruction.element));
    for (const instruction of instructions) {
      const commands = [instruction, ...instruction.actions];

      for (const command of commands) {
        if (command.name === COMMANDS.con) continue;
        if (command.mode) {
          if (OPERATORS.includes(command.name)) createOperator(command);
          else MODES_MAP[command.name].parse(command);
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
      if (instruction.name === COMMANDS.n && instruction.modifier && !isSynthPreset(instruction.modifier)) {
        throw Error(`Unknown synth preset "${instruction.modifier}".`);
      }
      if (instruction.targetBus && !declaredBuses.has(instruction.targetBus)) {
        throw Error(`Unknown bus "${instruction.targetBus}".`);
      }
    }
  }

  async add (instructions: Array<IInstruction>) {
    if (instructions.length) {
      this.app.$debugger.add('ADD', instructions);
    }

    const addedKeys: string[] = [];
    try {
      const orderedInstructions = [...instructions].sort((left, right) => Number(right.name === COMMANDS.bus) - Number(left.name === COMMANDS.bus));
      for (let i = 0; i < orderedInstructions.length; i++) {
        const instruction: IInstruction = orderedInstructions[i];
        if (!this.instructions[instruction.key]) {
          const element = COMMANDS_ELEMENT_MAP[instruction.name](instruction, this.app) as IInstrument;
          this.instructions[instruction.key] = element;
          if (instruction.name === COMMANDS.bus) this.buses.set(instruction.element, element as unknown as IBus);
          addedKeys.push(instruction.key);
          await element.start();
          if (this.muted.has(instruction.key)) {
            element.setMuted(true);
          }
        }
      }
    } catch (error) {
      for (const key of addedKeys) {
        try {
          await this.instructions[key]?.end();
        } catch {
          // ignore cleanup errors
        }
        delete this.instructions[key];
      }
      throw error;
    }
  }

  async update (instructions: Array<IInstruction>, previousInstructions: Record<string, IInstruction> = {}) {
    if (instructions.length) {
      this.app.$debugger.add('UPDATE', instructions);
    }

    const updatedKeys: string[] = [];
    let failedKey: string | undefined;

    try {
      const ordered = [...instructions].sort((left, right) => Number(right.name === COMMANDS.bus) - Number(left.name === COMMANDS.bus));
      for (let i = 0; i < ordered.length; i++) {
        const instruction: IInstruction = ordered[i];
        if (this.instructions[instruction.key]) {
          failedKey = instruction.key;
          await this.instructions[instruction.key].update(instruction as IInstrument);
          updatedKeys.push(instruction.key);
          failedKey = undefined;
        }
      }
    } catch (error) {
      const keysToRollback = new Set(updatedKeys);
      if (failedKey) {
        keysToRollback.add(failedKey);
      }

      for (const key of keysToRollback) {
        const prev = previousInstructions[key];
        if (prev && this.instructions[key]) {
          try {
            await this.instructions[key].update(prev as IInstrument);
          } catch {
            // ignore rollback errors
          }
        }
      }
      throw error;
    }
  }

  async delete (instructions: Array<IInstruction>) {
    if (instructions.length) {
      this.app.$debugger.add('DELETE', instructions);
    }

    const ordered = [...instructions].sort((left, right) => Number(left.name === COMMANDS.bus) - Number(right.name === COMMANDS.bus));
    for (let i = 0; i < ordered.length; i++) {
      const instruction: IInstruction = ordered[i];
      if (this.instructions[instruction.key]) {
        try {
          await this.instructions[instruction.key].end();
        } catch {
          // ignore cleanup errors to guarantee deleting all remaining instructions
        } finally {
          delete this.instructions[instruction.key];
          if (instruction.name === COMMANDS.bus) this.buses.delete(instruction.element);
        }
      }
    }
  }
}

import * as Tone from 'tone';
import type { IApp, IBus, IEffect, IInstruction } from '~/src/types';
import { EFFECTS_MAP } from '~/src/packages/Music/constants/effects';
import Instruction from '~/src/packages/Compiler/services/Instruction';

export default class Bus extends Instruction implements IBus {
  private app: IApp;
  private node: Tone.Gain;
  private effects: IEffect[] = [];

  constructor (instruction: IInstruction, app: IApp) {
    super(instruction);
    this.app = app;
    this.node = new Tone.Gain();
  }

  async start (): Promise<void> {
    let previous: IEffect | undefined;
    for (const action of this.actions) {
      const effect = EFFECTS_MAP[action.name](action, this.app);
      effect.create();
      if (previous) effect.connect(previous);
      else effect.toDestination();
      previous = effect;
      this.effects.push(effect);
    }
    if (previous) this.node.connect((previous as IEffect & { output: Tone.ToneAudioNode }).output);
    else this.node.toDestination();
  }

  async update (instruction: IInstruction): Promise<void> {
    this.node.disconnect();
    for (const effect of this.effects) await effect.end();
    this.effects = [];
    this.actions = instruction.actions;
    await this.start();
  }

  async end (): Promise<void> {
    for (const effect of this.effects) await effect.end();
    this.effects = [];
  }

  get output (): Tone.Gain { return this.node; }
}

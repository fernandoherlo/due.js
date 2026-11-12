import type { EffectsMap, IApp, IEffect, IInstruction, IInstrument, INote, IOperator } from '~/src/types';
import * as Tone from 'tone';
import Instruction from '~/src/packages/Compiler/services/Instruction';
import { TYPE_VALUE } from '~/src/packages/Compiler/constants';
import TriggerAttack from './triggerAttack';
import LogInstrument from './logInstrument';
import { createOperators } from '~/src/packages/Music/helpers/createOperators';

export default class Instrument extends Instruction implements IInstrument {
  protected app: IApp;
  protected instrument: any | null = null;
  protected canUpdate: boolean = false;
  muted: boolean = false;

  private loop: Tone.Loop<Tone.LoopOptions> | null = null;
  private valueStep: number = 0;
  private operators: IOperator[] = [];

  constructor (data: any, app: IApp) {
    super(data);

    this.app = app;
    this.setOperators(this.actions);
  }

  protected setOperators (actions: IInstruction[]): void {
    this.operators = createOperators(actions ?? []);
  }

  async start (): Promise<void> {
    await this.play();
  }

  async startActions (effects: EffectsMap): Promise<void> {
    let lastAction: any | null = null;

    for (let i = 0; i < this.actions.length; i++) {
      const action: IInstruction = this.actions[i];
      if (action.mode) continue;

      const element = effects[action.name](action, this.app) as IEffect;
      element.create();
      this.actions[i] = element;

      if (!lastAction) {
        this.actions[i].toDestination();
      } else {
        this.actions[i].connect(lastAction);
      }

      lastAction = element;
    }

    return lastAction;
  }

  async play (): Promise<void> {
    const note: INote = TriggerAttack.getValue(this.value);

    if (this.loop) {
      await this.loop.cancel();
      await this.loop.dispose();
    }

    this.loop = new Tone.Loop((time: number) => {
      if (this.instrument) {
        if (!this.muted) {
          this.app.$ui.clearPatternStep(this.key);
          const logNote = TriggerAttack.play(
            this.value,
            this.typeValue,
            this.valueStep,
            this.instrument,
            time,
            this.operators,
            (step, eventTime) => {
              Tone.getDraw().schedule(
                () => this.app.$ui.updatePatternStep(this.key, step),
                eventTime ?? time
              );
            }
          );
          LogInstrument.log(this.app.$logger, this, logNote);
        }

        if (this.loop) {
          this.loop.interval = parseFloat(TriggerAttack.getValue(note.interval));
        }
        if (this.typeValue === TYPE_VALUE.sequence) {
          this.valueStep++;
        }
      }
    }, parseFloat(TriggerAttack.getValue(note.interval))).start(0);
  }

  setMuted (muted: boolean): void {
    this.muted = muted;
    if (muted) {
      this.instrument?.releaseAll?.();
    }
  }

  async end (): Promise<void> {
    if (this.loop) {
      await this.loop.cancel();
      await this.loop.dispose();
    }

    if (this.actions) {
      for (let i = 0; i < this.actions.length; i++) {
        if (this.actions[i].mode) continue;
        await this.actions[i].end();
      }
    }

    if (this.instrument) {
      await this.instrument.disconnect();
      await this.instrument.dispose();
    }
  }

  async update (newInstrument: IInstrument): Promise<void> {
    if (this.canUpdate) {
      this.value = newInstrument.value;
      this.typeValue = newInstrument.typeValue;
      this.modifier = newInstrument.modifier;
      this.setOperators(newInstrument.actions);
      await this.play();
    }
  }
}

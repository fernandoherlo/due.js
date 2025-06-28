import * as Tone from 'tone';
import type { IApp, IInstruction, IInstrument, INote } from '~/src/types';
import Instruction from '~/src/packages/Compiler/services/Instruction';
import { TYPE_VALUE } from '~/src/packages/Compiler/constants';
import TriggerAttack from './triggerAttack';
import LogInstrument from './logInstrument';
import { COMMANDS_ELEMENT_MAP } from '../../constants';

export default class Instrument extends Instruction implements IInstrument {
  protected app: IApp;
  protected instrument: any | null = null;
  protected canUpdate: boolean = false;

  private loop: Tone.Loop<Tone.LoopOptions> | null = null;
  private valueStep: number = 0;

  constructor (data: any, app: IApp) {
    super(data);

    this.app = app;
  }

  async start (): Promise<void> {
    await this.play();
  }

  async startActions (): Promise<void> {
    let lastAction: any | null = null;

    for (let i = 0; i < this.actions.length; i++) {
      const action: IInstruction = this.actions[i];

      const element = COMMANDS_ELEMENT_MAP[action.name](action, this.app);
      await element.create();
      this.actions[i] = element;

      if (i === 0) {
        this.actions[i].toDestination();
      } else {
        if (lastAction) {
          this.actions[i].connect(lastAction);
        }
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

    this.loop = new Tone.Loop((/* time: number */) => {
      if (this.instrument) {
        const logNote = TriggerAttack.play(this.value, this.typeValue, this.valueStep, this.instrument);
        LogInstrument.log(this.app.$logger, this, logNote);

        if (this.loop) {
          this.loop.interval = parseFloat(TriggerAttack.getValue(note.interval));
        }
        if (this.typeValue === TYPE_VALUE.sequence) {
          this.valueStep++;
        }
      }
    }, parseFloat(TriggerAttack.getValue(note.interval))).start(0);
  }

  async end (): Promise<void> {
    if (this.loop) {
      await this.loop.cancel();
      await this.loop.dispose();
    }

    if (this.actions) {
      for (let i = 0; i < this.actions.length; i++) {
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
      await this.play();
    }
  }
}

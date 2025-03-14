import * as Tone from 'tone';
import { IApp, IInstruction, IInstrument, INote } from '~/src/vite-env';
import Instruction from '~/src/packages/Compiler/services/Instruction';
import { TYPE_VALUE } from '~/src/packages/Compiler/constants';
import TriggerAttack from './triggerAttack';
import { COMMANDS_ELEMENT_MAP } from '../../constants';

export default class Instrument extends Instruction implements IInstrument {
  protected _app: IApp;
  protected _instrument: any | null = null;
  protected _canUpdate: boolean = false;
  private _loop: Tone.Loop<Tone.LoopOptions> | null = null;
  private _valueStep: number = 0;

  constructor (data: any, app: IApp) {
    super(data);

    this._app = app;
  }

  async start (): Promise<void> {
    await this.play();
  }

  async startActions (): Promise<void> {
    let lastAction: any | null = null;

    for (let i = 0; i < this.actions.length; i++) {
      const action: IInstruction = this.actions[i];

      const element = COMMANDS_ELEMENT_MAP[action.name](action, this._app);
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

    if (this._loop) {
      await this._loop.cancel();
      await this._loop.dispose();
    }

    this._loop = new Tone.Loop((/* time: number */) => {
      if (this._instrument) {
        TriggerAttack.play(this.value, this.typeValue, this._valueStep, this._instrument);

        if (this._loop) {
          this._loop.interval = parseFloat(TriggerAttack.getValue(note.interval));
        }
        if (this.typeValue === TYPE_VALUE.sequence) {
          this._valueStep++;
        }
      }
    }, parseFloat(TriggerAttack.getValue(note.interval))).start(0);
  }

  async end (): Promise<void> {
    if (this._loop) {
      await this._loop.cancel();
      await this._loop.dispose();
    }

    if (this.actions) {
      for (let i = 0; i < this.actions.length; i++) {
        await this.actions[i].end();
      }
    }

    if (this._instrument) {
      await this._instrument.disconnect();
      await this._instrument.dispose();
    }
  }

  async update (newInstrument: IInstrument): Promise<void> {
    if (this._canUpdate) {
      this.value = newInstrument.value;
      this.typeValue = newInstrument.typeValue;
      this.modifier = newInstrument.modifier;
      await this.play();
    }
  }
}

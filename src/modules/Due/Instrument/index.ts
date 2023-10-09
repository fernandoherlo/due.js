import * as Tone from 'tone';
import { IApp, IInstruction, IInstrument, INote } from '~/src/vite-env';
import Instruction from '~/src/modules/Compiler/Instruction';
import { COMMANDS_ELEMENT_MAP } from '../constants';
import TriggerAttack from './triggerAttack';

export default class Instrument extends Instruction implements IInstrument {
  _app: IApp;
  _instrument: any | null = null;
  _canUpdate: boolean = false;
  _loop: Tone.Loop<Tone.LoopOptions> | null = null;
  _valueStep: number = 0;

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

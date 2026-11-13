import type { IApp, IVariableLive } from '~/src/types';
import Instruction from '~/src/packages/Compiler/services/Instruction';
import MidiIn from '../MidiIn';

export default class VariableLive extends Instruction implements IVariableLive {
  private app: IApp;

  constructor (data: any, app: IApp) {
    super(data);

    this.app = app;
  }

  async start (): Promise<void> {
    this.app.$liveVariableRegistry.configure(this.key, this.value.range);
    const midiIn = new MidiIn(this, this.app);
    try {
      await midiIn.start();
    } catch (error) {
      this.app.$liveVariableRegistry.reset(this.key);
      throw error;
    }
    this.app.$variablesLive[this.key] = midiIn;
  }

  async end (): Promise<void> {
    if (this.app.$variablesLive[this.key]) {
      await this.app.$variablesLive[this.key].end();
      delete this.app.$variablesLive[this.key];
    }
    this.app.$liveVariableRegistry.reset(this.key);
  }

  async update (newVariable: IVariableLive): Promise<void> {
    this.value = newVariable.value;
    this.typeValue = newVariable.typeValue;
    this.modifier = newVariable.modifier;

    await this.end();
    await this.start();
  }
}

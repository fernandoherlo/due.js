import type { IApp, IMidiIn, IVariableLive } from '~/src/types';
import Instruction from '~/src/packages/Compiler/services/Instruction';
import { COMMANDS } from '~/src/packages/Compiler/constants';
import { COMMANDS_ELEMENT_MAP } from '../../constants';

export default class VariableLive extends Instruction implements IVariableLive {
  private app: IApp;

  constructor (data: any, app: IApp) {
    super(data);

    this.app = app;
  }

  async start (): Promise<void> {
    this.app.$variablesLive[this.key] = COMMANDS_ELEMENT_MAP[COMMANDS.mi](this, this.app) as IMidiIn;

    await this.app.$variablesLive[this.key].start();
  }

  async end (): Promise<void> {
    if (this.app.$variablesLive[this.key]) {
      await this.app.$variablesLive[this.key].end();
      delete this.app.$variablesLive[this.key];
    }
  }

  async update (newVariable: IVariableLive): Promise<void> {
    this.value = newVariable.value;
    this.typeValue = newVariable.typeValue;
    this.modifier = newVariable.modifier;

    await this.end();
    await this.start();
  }
}

import { IApp, IVariableLive } from '~/src/vite-env';
import Instruction from '~/src/packages/Compiler/services/Instruction';
import { COMMANDS } from '~/src/packages/Compiler/constants';
import { COMMANDS_ELEMENT_MAP } from '../../constants';

export default class VariableLive extends Instruction implements IVariableLive {
  _app: IApp;
  declare value: any;

  constructor (data: any, app: IApp) {
    super(data);

    this._app = app;
  }

  async start (): Promise<void> {
    this._app.$variablesLive[this.key] = COMMANDS_ELEMENT_MAP[COMMANDS.mi](this, this._app);

    await this._app.$variablesLive[this.key].start();
  }

  async end (): Promise<void> {
    if (this._app.$variablesLive[this.key]) {
      await this._app.$variablesLive[this.key].end();
      delete this._app.$variablesLive[this.key];
    }
  }

  async update (newVariable: IVariableLive) {
    this.value = newVariable.value;
    this.typeValue = newVariable.typeValue;
    this.modifier = newVariable.modifier;

    await this.end();
    await this.start();
  }
}

import { IApp, IVariable } from '~/src/vite-env';
import Instruction from '~/src/modules/Compiler/Instruction';

export default class Variable extends Instruction implements IVariable {
  _app: IApp;

  constructor (data: any, app: IApp) {
    super(data);

    this._app = app;
  }

  async start (): Promise<void> {
    this._app.$variablesLive[this.key] = this.value;
  }

  async end (): Promise<void> {
    delete this._app.$variablesLive[this.key];
  }

  async update (newVariable: IVariable) {
    this._app.$variablesLive[this.key] = newVariable.value;
  }
}

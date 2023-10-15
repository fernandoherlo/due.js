import { IEffect } from '~/src/vite-env';
import Instrument from '../Instrument';
import { COMMANDS } from '../../Compiler/constants';

export default class Effect extends Instrument implements IEffect {
  _effect: any | null = null;
  _canUpdate: boolean = true;

  create () {
    if (this._effect) {
      this._effect.debug = this._app.$debug;
    }
  }

  toDestination () {
    if (this._effect) {
      this._effect.toDestination();
    }
  }

  connect (action: any) {
    if (this._effect) {
      this._effect.connect(action._effect);
    }
  }

  async end (): Promise<void> {
    if (this._effect) {
      await this._effect.disconnect();
      await this._effect.dispose();
    }
  }

  _getValue (value: any) {
    if (value && typeof value === 'string' && value.startsWith(COMMANDS.$$)) {
      this._app.$variablesLiveMap[value] = this;
      return 0; // default, set on live midi in
    }

    return parseFloat(value);
  }
}

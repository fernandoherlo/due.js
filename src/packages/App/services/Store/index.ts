import type { IStore } from '~/src/types';

export default class Store implements IStore {
  state: any;

  constructor () {
    this.state = {};
  }
}

import { IStore } from '~/src/vite-env';

export default class Store implements IStore {
  state: any;

  constructor () {
    this.state = {};
  }
}

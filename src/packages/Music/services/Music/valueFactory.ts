import { INote, IValueFactory } from '~/src/vite-env';
import Note from '../Note';
import getter from '../Variable/getter';

export default class ValueFactory implements IValueFactory {
  create (data: any, defaults: boolean): INote {
    return new Note(data, defaults);
  }

  adapt (valueRaw: any, variables: any): any {
    return getter(valueRaw, variables);
  }
}

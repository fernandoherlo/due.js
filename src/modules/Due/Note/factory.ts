import { INote } from '~/src/vite-env';
import Note from '.';
import getter from '../Variable/getter';

export default class NoteFactory {
  static create (data: any, defaults: boolean): INote {
    return new Note(data, defaults);
  }

  static adapt (valueRaw: any, variables: any): any {
    return getter(valueRaw, variables);
  }
}

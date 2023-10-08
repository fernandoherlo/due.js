import { INote } from '~/src/vite-env';
import Note from '.';

export default function NoteFactory (data: any, defaults: boolean): INote {
  return new Note(data, defaults);
}

import { customAlphabet } from "nanoid";

export interface Note {
  id: string;
  title: string;
  body: string;
}

const makeId = customAlphabet("abcdefgh", 8);
const notes: Note[] = [];

export function addNote(title: string, body: string): Note {
  const note = { id: makeId(), title, body };
  notes.push(note);
  return note;
}

export function listNotes(): Note[] {
  return [...notes];
}

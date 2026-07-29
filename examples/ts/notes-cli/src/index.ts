import { formatNote } from "./format";
import { addNote, listNotes } from "./store";

export function main(): void {
  addNote("groceries", "milk, eggs");
  addNote("wayfind", "ship M1");
  for (const note of listNotes()) {
    console.log(formatNote(note.title, note.body));
  }
}

main();

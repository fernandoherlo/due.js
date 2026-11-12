import { foldService } from '@codemirror/language';

const sectionComment = /^\s*\/\//;

export const dueRegionFolding = foldService.of((state, lineStart, lineEnd) => {
  if (!sectionComment.test(state.doc.sliceString(lineStart, lineEnd))) return null;
  const firstLine = state.doc.lineAt(lineStart).number + 1;
  for (let number = firstLine; number <= state.doc.lines; number++) {
    const line = state.doc.line(number);
    if (sectionComment.test(line.text)) {
      const foldEnd = line.from - 1;
      return foldEnd > lineEnd ? { from: lineEnd, to: foldEnd } : null;
    }
  }

  return null;
});

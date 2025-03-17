import { HighlightStyle } from '@codemirror/language';
import { tags as t } from '@lezer/highlight';

const $black = '#15141b';
const $white = '#edecee';
const $gray = '#6d6d6d';
const $purple = '#a277ff';
const $purpleFading = '#3d375e7f';
const $green = '#61ffca';
const $orange = '#ffca85';
const $pink = '#f694ff';
const $blue = '#82e2ff';
const $red = '#ff6767';

export const DueTheme: any = {
  '&': {
    fontSize: '18pt',
    fontFamily: 'Fira Code',
    color: $white,
    background: $black
  },
  '.cm-content': {
    caretColor: $purple
  },
  '.cm-cursor, .cm-dropCursor': { borderLeftColor: $purple },
  '&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection': { backgroundColor: $purpleFading },
  '.cm-gutters': {
    backgroundColor: $black,
    color: $purpleFading,
    border: 'none'
  }
};

export const DueThemeHighlightStyle: HighlightStyle = HighlightStyle.define([
  {
    tag: t.keyword,
    color: $purple
  },
  {
    tag: [t.name, t.deleted, t.character, t.propertyName, t.macroName],
    color: $pink
  },
  {
    tag: [t.function(t.variableName), t.labelName],
    color: $orange
  },
  {
    tag: [t.color, t.constant(t.name), t.standard(t.name)],
    color: $blue
  },
  {
    tag: [t.definition(t.name), t.separator],
    color: $purple
  },
  {
    tag: [t.typeName, t.className, t.number, t.changed, t.annotation, t.modifier, t.self, t.namespace],
    color: $pink
  },
  {
    tag: [t.operator, t.operatorKeyword, t.url, t.escape, t.regexp, t.link, t.special(t.string)],
    color: $green
  },
  {
    tag: [t.meta, t.comment],
    color: $gray
  },
  {
    tag: t.strong,
    fontWeight: 'bold'
  },
  {
    tag: t.emphasis,
    fontStyle: 'italic'
  },
  {
    tag: t.strikethrough,
    textDecoration: 'line-through'
  },
  {
    tag: t.link,
    color: $gray,
    textDecoration: 'underline'
  },
  {
    tag: t.heading,
    fontWeight: 'bold',
    color: $red
  },
  {
    tag: [t.atom, t.bool, t.special(t.variableName)],
    color: $blue
  },
  {
    tag: t.invalid,
    color: $red
  }
]);

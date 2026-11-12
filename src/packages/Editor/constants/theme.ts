import type { StyleSpec } from 'style-mod';
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

export const DueTheme: { [selector: string]: StyleSpec } = {
  '&': {
    position: 'relative',
    height: '100%',
    fontSize: '18pt',
    fontFamily: 'Fira Code',
    color: $white,
    background: $black
  },
  '.cm-scroller': {
    overflow: 'auto',
    marginInlineEnd: '40px'
  },
  '.cm-no-minimap .cm-scroller': {
    marginInlineEnd: '0'
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
  },
  '.cm-foldGutter': {
    width: '1em',
    color: $gray,
    textAlign: 'center',
    cursor: 'pointer'
  },
  '.cm-foldGutter span': {
    padding: '0 1px',
    cursor: 'pointer'
  },
  '.cm-foldPlaceholder': {
    backgroundColor: '#24222c',
    border: '1px solid #484550',
    color: $gray,
    borderRadius: '2px',
    margin: '0 1px',
    padding: '0 2px',
    cursor: 'pointer'
  },
  '.cm-minimap': {
    position: 'absolute',
    insetBlock: '4px',
    insetInlineEnd: '3px',
    zIndex: '2',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    gap: '1px',
    overflow: 'hidden',
    width: '32px',
    padding: '1px',
    backgroundColor: $black,
    cursor: 'pointer'
  },
  '.cm-minimap[hidden]': {
    display: 'none'
  },
  '.cm-minimap-line': {
    display: 'block',
    flex: '1 1 0',
    minHeight: '0',
    backgroundColor: $gray,
    opacity: '0.5'
  },
  '.cm-minimap-line.cm-minimap-comment': {
    backgroundColor: $purpleFading
  },
  '.cm-minimap-line.cm-minimap-track': {
    backgroundColor: $blue
  },
  '.cm-minimap-line.cm-minimap-visible': {
    backgroundColor: $orange,
    opacity: '0.8'
  },
  '.cm-minimap-line.cm-minimap-cursor': {
    backgroundColor: $green,
    opacity: '1'
  },
  '.cm-mute-gutter': {
    width: '1.5em',
    textAlign: 'center',
    cursor: 'pointer'
  },
  '.cm-mute-marker': {
    fontSize: '10pt',
    color: $gray
  },
  '.cm-mute-marker.cm-muted': {
    color: $red,
    fontWeight: '600'
  },
  '.cm-active-pattern-note': {
    backgroundColor: '#25473e',
    borderRadius: '2px'
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

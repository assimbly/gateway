/** Where keys type text, so single-key shortcuts must leave them alone: form fields, editable content and code editors. */
const TYPING_TARGETS = 'input, textarea, select, [contenteditable], .CodeMirror';

export function isTypingTarget(target: EventTarget | null): boolean {
  return target instanceof Element && !!target.closest(TYPING_TARGETS);
}

/** Ctrl+S, or Cmd+S on a Mac. Shift and Alt are left to the browser (Ctrl+Shift+S takes a screenshot in Firefox). */
export function isSaveShortcut(event: KeyboardEvent): boolean {
  return (event.ctrlKey || event.metaKey) && !event.shiftKey && !event.altKey && event.key?.toLowerCase() === 's';
}

/** Ctrl+Enter, or Cmd+Enter on a Mac: runs what is being edited, like Send or Save & start. */
export function isRunShortcut(event: KeyboardEvent): boolean {
  return (event.ctrlKey || event.metaKey) && !event.shiftKey && !event.altKey && event.key === 'Enter';
}

/** Ctrl+Shift+Enter, or Cmd+Shift+Enter on a Mac: stops what Ctrl+Enter runs. */
export function isStopShortcut(event: KeyboardEvent): boolean {
  return (event.ctrlKey || event.metaKey) && event.shiftKey && !event.altKey && event.key === 'Enter';
}

/** A key pressed on its own, without Ctrl, Cmd or Alt. */
export function isPlainKey(event: KeyboardEvent, key: string): boolean {
  return event.key === key && !event.ctrlKey && !event.metaKey && !event.altKey;
}

/** Ctrl+Enter, or Cmd+Enter on a Mac: runs what is being edited, like Send or Save & start. */
export function isRunShortcut(event: KeyboardEvent): boolean {
  return (event.ctrlKey || event.metaKey) && !event.shiftKey && !event.altKey && event.key === 'Enter';
}

/** Ctrl+Shift+Enter, or Cmd+Shift+Enter on a Mac: stops what Ctrl+Enter runs. */
export function isStopShortcut(event: KeyboardEvent): boolean {
  return (event.ctrlKey || event.metaKey) && event.shiftKey && !event.altKey && event.key === 'Enter';
}

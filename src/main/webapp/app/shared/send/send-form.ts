/** Moves the focus to the first invalid field of a Send page and scrolls it into view. */
export function focusFirstInvalid(root: HTMLElement | null | undefined): void {
  const invalid = root?.querySelector<HTMLElement>('.ng-invalid:not(form):not([formgroupname]):not([formarrayname]), .is-invalid');
  if (!invalid) {
    return;
  }
  const field = invalid.matches('input, select, textarea') ? invalid : invalid.querySelector<HTMLElement>('input, select, textarea');
  invalid.scrollIntoView?.({ block: 'center' });
  field?.focus();
}

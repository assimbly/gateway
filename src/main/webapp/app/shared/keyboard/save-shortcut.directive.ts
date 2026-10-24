import { Directive, ElementRef, inject, input, output } from '@angular/core';
import { DOCUMENT } from '@angular/common';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { isSaveShortcut } from './keyboard';

/**
 * Ctrl+S (Cmd+S) saves the form it is on, wherever the focus is, also while typing in a field or code editor; the
 * browser's own "Save page" never opens. While a dialog is open only the form in that dialog saves, so a dialog opened
 * over an editor doesn't save the editor too.
 */
@Directive({
  selector: '[jhiSaveShortcut]',
  host: {
    '(document:keydown)': 'onKeydown($event)',
  },
})
export class SaveShortcutDirective {
  readonly jhiSaveShortcut = output<void>();
  /** True while saving isn't possible, like the Save button's disabled state. */
  readonly saveShortcutDisabled = input(false);

  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly document = inject(DOCUMENT);
  private readonly modals = inject(NgbModal);

  onKeydown(event: KeyboardEvent): void {
    if (!isSaveShortcut(event)) {
      return;
    }
    event.preventDefault();
    if (!this.saveShortcutDisabled() && this.inFrontmostLayer()) {
      this.jhiSaveShortcut.emit();
    }
  }

  private inFrontmostLayer(): boolean {
    if (!this.modals.hasOpenModals()) {
      return true;
    }
    const windows = this.document.querySelectorAll('ngb-modal-window');
    return !!windows[windows.length - 1]?.contains(this.element.nativeElement);
  }
}

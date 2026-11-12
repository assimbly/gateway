import { Component, inject } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { IconProp } from '@fortawesome/fontawesome-svg-core';

/** One button of the dialog; the dialog closes with its value. */
export interface ConfirmChoice<T extends string> {
  value: T;
  label: string;
  style: 'primary' | 'secondary' | 'danger';
  icon?: IconProp;
}

/** Asks the user to choose, in the app's own dialog rather than the browser's. */
@Component({
  selector: 'jhi-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  imports: [FontAwesomeModule],
})
export class ConfirmDialogComponent {
  title = '';
  message = '';
  choices: ConfirmChoice<string>[] = [];

  readonly activeModal = inject(NgbActiveModal);
}

/**
 * Opens the dialog and resolves with the chosen value, or undefined when it is closed without a choice (Escape, the ×
 * or the Close button).
 */
export function confirmChoice<T extends string>(modal: NgbModal, title: string, message: string, choices: ConfirmChoice<T>[]): Promise<T | undefined> {
  const ref = modal.open(ConfirmDialogComponent, { backdrop: 'static' });
  Object.assign(ref.componentInstance as ConfirmDialogComponent, { title, message, choices });
  return ref.result.then(
    (value: T) => value,
    (): undefined => undefined,
  );
}

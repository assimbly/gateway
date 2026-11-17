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
export function confirmChoice<T extends string>(
  modal: NgbModal,
  title: string,
  message: string,
  choices: ConfirmChoice<T>[],
): Promise<T | undefined> {
  const ref = modal.open(ConfirmDialogComponent, { backdrop: 'static' });
  Object.assign(ref.componentInstance as ConfirmDialogComponent, { title, message, choices });
  return ref.result.then(
    (value: T) => value,
    (): undefined => undefined,
  );
}

const LIVE_ACTIONS = {
  stop: { verb: 'Stop', message: 'Messages stop being processed until the Flow is started again.', icon: 'stop' },
  restart: { verb: 'Restart', message: 'Messages stop being processed while the Flow restarts.', icon: 'redo' },
} as const;

/**
 * Stops or restarts a Flow at once, or on a Gateway on stage Production only after the user confirms it: one click on
 * a small icon shouldn't stop a live Flow.
 */
export function confirmOnProduction(
  modal: NgbModal,
  production: boolean,
  action: 'stop' | 'restart',
  flowName: string,
  proceed: () => void,
): void {
  if (!production) {
    proceed();
    return;
  }
  const { verb, message, icon } = LIVE_ACTIONS[action];
  void confirmChoice(modal, `${verb} ${flowName}?`, message, [
    { value: 'cancel', label: 'Cancel', style: 'secondary' },
    { value: action, label: verb, style: 'danger', icon },
  ]).then(choice => {
    if (choice === action) {
      proceed();
    }
  });
}

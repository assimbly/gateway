import { Component, input, output } from '@angular/core';

import { NgClass } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap/tooltip';

export type StatusControlsTone = 'default' | 'started' | 'paused' | 'failed';

@Component({
  selector: 'jhi-status-controls',
  imports: [NgClass, FontAwesomeModule, NgbTooltip],
  templateUrl: './status-controls.html',
})
export default class StatusControls {
  readonly busy = input(false);
  readonly tone = input<StatusControlsTone>('default');
  readonly showStart = input(false);
  readonly showPause = input(false);
  readonly showResume = input(false);
  readonly showStop = input(false);
  readonly showRestart = input(false);
  readonly stopDisabled = input(false);
  readonly startDisabled = input(false);
  readonly pauseDisabled = input(false);
  readonly resumeDisabled = input(false);
  readonly restartDisabled = input(false);

  readonly start = output<void>();
  readonly pause = output<void>();
  readonly resume = output<void>();
  readonly stop = output<void>();
  readonly restart = output<void>();

  statusClass(): string {
    switch (this.tone()) {
      case 'started':
        return 'btn-fx-success';
      case 'paused':
        return 'btn-fx-warning';
      case 'failed':
        return 'btn-fx-danger';
      default:
        return 'btn-fx-secondary';
    }
  }
}

import { Component, OnDestroy, computed, inject, input } from '@angular/core';

import { NgbAlert } from '@ng-bootstrap/ng-bootstrap/alert';

import { AlertModel, AlertService } from 'app/core/util';

@Component({
  selector: 'jhi-alert',
  templateUrl: './alert.html',
  imports: [NgbAlert],
})
export class Alert implements OnDestroy {
  /**
   * Leaves errors out, as the app-wide outlet does: a page shows its own errors, and older pages still raise
   * the raw HTTP text as an alert.
   */
  readonly withoutErrors = input(false);

  readonly alerts = computed(() => {
    const alerts = this.alertService.alerts();
    return this.withoutErrors() ? alerts.filter(alert => alert.type !== 'danger') : alerts;
  });

  private readonly alertService = inject(AlertService);

  setClasses(alert: AlertModel): Record<string, boolean> {
    const classes = { 'jhi-toast': Boolean(alert.toast) };
    if (alert.position) {
      return { ...classes, [alert.position]: true };
    }
    return classes;
  }

  ngOnDestroy(): void {
    this.alertService.clear();
  }

  close(alert: AlertModel): void {
    alert.close?.();
  }
}

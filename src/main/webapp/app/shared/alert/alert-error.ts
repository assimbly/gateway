import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, inject, signal } from '@angular/core';

import { NgbAlert } from '@ng-bootstrap/ng-bootstrap/alert';
import { Subscription } from 'rxjs';

import { AlertModel, AlertService, EventManager, EventWithContent } from 'app/core/util';
import { getMessageFromHeaders } from 'app/shared/jhipster/headers';

import { AlertErrorModel } from './alert-error.model';

@Component({
  selector: 'jhi-alert-error',
  templateUrl: './alert-error.html',
  imports: [NgbAlert],
})
export class AlertError implements OnDestroy {
  readonly alerts = signal<AlertModel[]>([]);
  errorListener: Subscription;
  httpErrorListener: Subscription;

  private readonly alertService = inject(AlertService);
  private readonly eventManager = inject(EventManager);

  constructor() {
    this.errorListener = this.eventManager.subscribe('gatewayApp.error', (response: EventWithContent<unknown>) => {
      const errorResponse = (response as EventWithContent<AlertErrorModel>).content;
      this.addErrorAlert(errorResponse.message);
    });

    this.httpErrorListener = this.eventManager.subscribe('gatewayApp.httpError', (response: EventWithContent<unknown>) => {
      this.handleHttpError(response);
    });
  }

  setClasses(alert: AlertModel): Record<string, boolean> {
    const classes = { 'jhi-toast': Boolean(alert.toast) };
    if (alert.position) {
      return { ...classes, [alert.position]: true };
    }
    return classes;
  }

  ngOnDestroy(): void {
    this.eventManager.destroy(this.errorListener);
    this.eventManager.destroy(this.httpErrorListener);
  }

  close(alert: AlertModel): void {
    alert.close?.();
  }

  private addErrorAlert(message?: string): void {
    // An error stays until the user closes it: the default five seconds are too short to read and act on it.
    this.alertService.addAlert({ type: 'danger', message, timeout: 0 }, this.alerts);
  }

  private handleHttpError(response: EventWithContent<unknown>): void {
    const httpErrorResponse = (response as EventWithContent<HttpErrorResponse>).content;
    switch (httpErrorResponse.status) {
      // connection refused, server not reachable
      case 0:
        this.addErrorAlert('Server not reachable');
        break;

      case 400: {
        this.handleBadRequest(httpErrorResponse);
        break;
      }

      case 404:
        this.addErrorAlert('Not found');
        break;

      default:
        this.handleDefaultError(httpErrorResponse);
    }
  }

  private handleBadRequest(httpErrorResponse: HttpErrorResponse): void {
    const headers = Object.fromEntries(httpErrorResponse.headers.keys().map(key => [key, httpErrorResponse.headers.getAll(key)]));
    const message = getMessageFromHeaders(headers);
    if (message.error) {
      this.addErrorAlert(message.error);
    } else if (httpErrorResponse.error !== '' && httpErrorResponse.error.fieldErrors) {
      this.handleFieldsError(httpErrorResponse);
    } else if (httpErrorResponse.error !== '' && httpErrorResponse.error.message) {
      this.addErrorAlert(httpErrorResponse.error.detail ?? httpErrorResponse.error.message);
    } else {
      this.addErrorAlert(httpErrorResponse.error);
    }
  }

  private handleDefaultError(httpErrorResponse: HttpErrorResponse): void {
    if (httpErrorResponse.error !== '' && httpErrorResponse.error.message) {
      this.addErrorAlert(httpErrorResponse.error.detail ?? httpErrorResponse.error.message);
    } else {
      this.addErrorAlert(httpErrorResponse.error);
    }
  }

  private handleFieldsError(httpErrorResponse: HttpErrorResponse): void {
    const { fieldErrors } = httpErrorResponse.error;
    for (const fieldError of fieldErrors) {
      this.addErrorAlert(`Error on field "${fieldError.field as string}"`);
    }
  }
}

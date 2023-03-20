import { Component, OnInit, OnDestroy, TemplateRef } from '@angular/core';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { EventManager, EventWithContent } from 'app/core/util/event-manager.service';
import { AlertService } from 'app/core/util/alert.service';
import { NgbModal, NgbActiveModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { IIntegration } from 'app/shared/model/integration.model';
import { IntegrationDeleteDialogComponent } from './integration-delete-dialog.component';
import { AccountService } from 'app/core/auth/account.service';
import { IntegrationService } from './integration.service';
import { FlowService } from '../flow/flow.service';

@Component({
    selector: 'jhi-integration',
    templateUrl: './integration.component.html'
})
export class IntegrationComponent implements OnInit, OnDestroy {
    integrations: IIntegration[] = [];
    currentAccount: any;
    eventSubscriber: Subscription;
    restartIntegrationMessage: string;
    modalRef: NgbModalRef | null;

    constructor(
        protected flowService: FlowService,
        protected integrationService: IntegrationService,
        protected alertService: AlertService,
        protected eventManager: EventManager,
        protected accountService: AccountService,
        private router: Router,
        private modalService: NgbModal
    ) {}

    loadAll() {
        this.integrationService.query().subscribe(
            (res: HttpResponse<IIntegration[]>) => {
                this.integrations = res.body;
            },
            (res: HttpErrorResponse) => this.onError(res.message)
        );
    }

    ngOnInit() {
        this.loadAll();
        this.accountService.identity().subscribe(account => {
            this.currentAccount = account;
        });
        this.registerChangeInIntegrations();
    }

    ngOnDestroy() {
        this.eventManager.destroy(this.eventSubscriber);
    }

    trackId(index: number, item: IIntegration) {
        return item.id;
    }

    registerChangeInIntegrations() {
        this.eventSubscriber = this.eventManager.subscribe('integrationListModification', response => this.loadAll());
    }

	delete(integration: IIntegration): void {
		const modalRef = this.modalService.open(IntegrationDeleteDialogComponent, { size: 'lg', backdrop: 'static' });
		modalRef.componentInstance.integration = integration;
		// unsubscribe not needed because closed completes on modal close
		modalRef.closed.subscribe(reason => {
		  if (reason === 'deleted') {
			this.loadAll();
		  }
		});
	}

    openModal(templateRef: TemplateRef<any>) {
        this.modalRef = this.modalService.open(templateRef);
    }

    openRestartIntegrationModal(templateRef: TemplateRef<any>) {
        this.restartIntegrationMessage = '';
        this.modalRef = this.modalService.open(templateRef);
    }

    cancelModal(): void {
        if (this.modalRef) {
            this.modalRef.dismiss();
            this.modalRef = null;
        }
    }

    restartIntegration(index: number) {
        this.integrationService.stop(index).subscribe(
            (res: HttpResponse<string>) => {
                this.startIntegration(index);
            },
            (res: HttpErrorResponse) => {
                this.restartIntegrationMessage = 'Assimbly Integration failed to stop: ' + res.message;
                this.onError(res.message);
            }
        );
    }

    startIntegration(index: number) {
        this.integrationService.start(index).subscribe(
            (res: HttpResponse<string>) => {
                this.restartIntegrationMessage = 'Assimbly Integration is (re)started successful';
            },
            (res: HttpErrorResponse) => {
                this.restartIntegrationMessage = 'Assimbly Integration failed to start: ' + res.message;
                this.onError(res.message);
            }
        );
    }

    protected onError(errorMessage: string) {
        this.alertService.addAlert({
		  type: 'danger',
		  message: errorMessage,
		});
    }

    reset() {
        this.integrations = [];
        this.loadAll();
    }
}

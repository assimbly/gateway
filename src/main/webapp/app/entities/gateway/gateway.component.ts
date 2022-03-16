import { Component, OnInit, OnDestroy, TemplateRef } from '@angular/core';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { EventManager, EventWithContent } from 'app/core/util/event-manager.service';
import { AlertService } from 'app/core/util/alert.service';
import { NgbModal, NgbActiveModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { IGateway } from 'app/shared/model/gateway.model';
import { GatewayDeleteDialogComponent } from './gateway-delete-dialog.component';
import { AccountService } from 'app/core/auth/account.service';
import { GatewayService } from './gateway.service';
import { FlowService } from '../flow/flow.service';

@Component({
    selector: 'jhi-gateway',
    templateUrl: './gateway.component.html'
})
export class GatewayComponent implements OnInit, OnDestroy {
    gateways: IGateway[] = [];
    currentAccount: any;
    eventSubscriber: Subscription;
    restartGatewayMessage: string;
    modalRef: NgbModalRef | null;

    constructor(
        protected flowService: FlowService,
        protected gatewayService: GatewayService,
        protected alertService: AlertService,
        protected eventManager: EventManager,
        protected accountService: AccountService,
        private router: Router,
        private modalService: NgbModal
    ) {}

    loadAll() {
        this.gatewayService.query().subscribe(
            (res: HttpResponse<IGateway[]>) => {
                this.gateways = res.body;
            },
            (res: HttpErrorResponse) => this.onError(res.message)
        );
    }

    ngOnInit() {
        this.loadAll();
        this.accountService.identity().subscribe(account => {
            this.currentAccount = account;
        });
        this.registerChangeInGateways();
    }

    ngOnDestroy() {
        this.eventManager.destroy(this.eventSubscriber);
    }

    trackId(index: number, item: IGateway) {
        return item.id;
    }

    registerChangeInGateways() {
        this.eventSubscriber = this.eventManager.subscribe('gatewayListModification', response => this.loadAll());
    }

	delete(gateway: IGateway): void {
		const modalRef = this.modalService.open(GatewayDeleteDialogComponent, { size: 'lg', backdrop: 'static' });
		modalRef.componentInstance.gateway = gateway;
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

    openRestartGatewayModal(templateRef: TemplateRef<any>) {
        this.restartGatewayMessage = '';
        this.modalRef = this.modalService.open(templateRef);
    }

    cancelModal(): void {
        if (this.modalRef) {
            this.modalRef.dismiss();
            this.modalRef = null;
        }
    }

    restartGateway(index: number) {
        this.gatewayService.stop(index).subscribe(
            (res: HttpResponse<string>) => {
                this.startGateway(index);
            },
            (res: HttpErrorResponse) => {
                this.restartGatewayMessage = 'Assimbly Gateway failed to stop: ' + res.message;
                this.onError(res.message);
            }
        );
    }

    startGateway(index: number) {
        this.gatewayService.start(index).subscribe(
            (res: HttpResponse<string>) => {
                this.restartGatewayMessage = 'Assimbly Gateway is (re)started successful';
            },
            (res: HttpErrorResponse) => {
                this.restartGatewayMessage = 'Assimbly Gateway failed to start: ' + res.message;
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
        this.gateways = [];
        this.loadAll();
    }
}

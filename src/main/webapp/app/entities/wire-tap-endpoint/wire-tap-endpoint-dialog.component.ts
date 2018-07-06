import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Response } from '@angular/http';

import { Observable } from 'rxjs/Observable';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { JhiEventManager, JhiAlertService } from 'ng-jhipster';

import { WireTapEndpoint } from './wire-tap-endpoint.model';
import { WireTapEndpointPopupService } from './wire-tap-endpoint-popup.service';
import { WireTapEndpointService } from './wire-tap-endpoint.service';
import { Service, ServiceService } from '../service';
import { Header, HeaderService } from '../header';
import { ResponseWrapper } from '../../shared';
import { Components } from '../../shared/camel/component-type';

@Component({
    selector: 'jhi-wire-tap-endpoint-dialog',
    templateUrl: './wire-tap-endpoint-dialog.component.html'
})
export class WireTapEndpointDialogComponent implements OnInit {

    wireTapEndpoint: WireTapEndpoint;
    isSaving: boolean;

    services: Service[];

    headers: Header[];

    constructor(
        public activeModal: NgbActiveModal,
        private jhiAlertService: JhiAlertService,
        private wireTapEndpointService: WireTapEndpointService,
        private serviceService: ServiceService,
        private headerService: HeaderService,
        private eventManager: JhiEventManager,
        private components: Components
    ) {
    }

    ngOnInit() {
        this.isSaving = false;
        this.serviceService.query()
            .subscribe((res: ResponseWrapper) => { this.services = res.json; }, (res: ResponseWrapper) => this.onError(res.json));
        this.headerService.query()
            .subscribe((res: ResponseWrapper) => { this.headers = res.json; }, (res: ResponseWrapper) => this.onError(res.json));
    }

    clear() {
        this.activeModal.dismiss('cancel');
    }

    save() {
        this.isSaving = true;
        if (this.wireTapEndpoint.id !== undefined) {
            this.subscribeToSaveResponse(
                this.wireTapEndpointService.update(this.wireTapEndpoint));
        } else {
            this.subscribeToSaveResponse(
                this.wireTapEndpointService.create(this.wireTapEndpoint));
        }
    }

    private subscribeToSaveResponse(result: Observable<WireTapEndpoint>) {
        result.subscribe((res: WireTapEndpoint) =>
            this.onSaveSuccess(res), (res: Response) => this.onSaveError());
    }

    private onSaveSuccess(result: WireTapEndpoint) {
        this.eventManager.broadcast({ name: 'wireTapEndpointListModification', content: 'OK' });
        this.isSaving = false;
        this.activeModal.dismiss(result);
    }

    private onSaveError() {
        this.isSaving = false;
    }

    private onError(error: any) {
        this.jhiAlertService.error(error.message, null, null);
    }

    trackServiceById(index: number, item: Service) {
        return item.id;
    }

    trackHeaderById(index: number, item: Header) {
        return item.id;
    }
}

@Component({
    selector: 'jhi-wire-tap-endpoint-popup',
    template: ''
})
export class WireTapEndpointPopupComponent implements OnInit, OnDestroy {

    routeSub: any;

    constructor(
        private route: ActivatedRoute,
        private wireTapEndpointPopupService: WireTapEndpointPopupService
    ) { }

    ngOnInit() {
        this.routeSub = this.route.params.subscribe((params) => {
            if (params['id']) {
                this.wireTapEndpointPopupService
                    .open(WireTapEndpointDialogComponent as Component, params['id']);
            } else {
                this.wireTapEndpointPopupService
                    .open(WireTapEndpointDialogComponent as Component);
            }
        });
    }

    ngOnDestroy() {
        this.routeSub.unsubscribe();
    }
}

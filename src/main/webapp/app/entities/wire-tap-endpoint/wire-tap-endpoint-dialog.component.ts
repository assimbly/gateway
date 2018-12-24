import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';

import { Observable } from 'rxjs';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { JhiEventManager, JhiAlertService } from 'ng-jhipster';

import { IWireTapEndpoint } from 'app/shared/model/wire-tap-endpoint.model';
import { WireTapEndpointService } from './wire-tap-endpoint.service';
import { IService, Service } from 'app/shared/model/service.model';
import { IHeader, Header } from 'app/shared/model/header.model';
import { ServiceService } from '../service';
import { HeaderService } from '../header';
import { Components } from '../../shared/camel/component-type';

@Component({
    selector: 'jhi-wire-tap-endpoint-dialog',
    templateUrl: './wire-tap-endpoint-dialog.component.html'
})
export class WireTapEndpointDialogComponent implements OnInit {

    wireTapEndpoint: IWireTapEndpoint;
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
        public components: Components
    ) {
    }

    ngOnInit() {
        this.isSaving = false;
        this.serviceService.query()
            .subscribe(res => { this.services = res.body; }, res => this.onError(res.body));
        this.headerService.query()
            .subscribe(res => { this.headers = res.body; }, res => this.onError(res.body));
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

    
    private subscribeToSaveResponse(result: Observable<HttpResponse<IWireTapEndpoint>>) {
        result.subscribe(data => {
            if(data.ok){
                this.onSaveSuccess(data.body);
            }else{
                this.onSaveError()
            }
            }    
        )
    }
    
    private onSaveSuccess(result: IWireTapEndpoint) {
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
        private route: ActivatedRoute
    ) { }

    ngOnInit() {
    }

    ngOnDestroy() {
        this.routeSub.unsubscribe();
    }
}

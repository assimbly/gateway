import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient, HttpResponse, HttpHeaders } from '@angular/common/http';

import { Observable } from 'rxjs';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { JhiEventManager, JhiAlertService } from 'ng-jhipster';

import { IErrorEndpoint, ErrorEndpoint } from 'app/shared/model/error-endpoint.model';
import { ErrorEndpointService } from './error-endpoint.service';
import { ServiceService } from '../service';
import { Service} from 'app/shared/model/service.model';
import { Header} from 'app/shared/model/header.model';

import { HeaderService } from '../header';
import { EndpointType, Components } from '../../shared/camel/component-type';

@Component({
    selector: 'jhi-error-endpoint-dialog',
    templateUrl: './error-endpoint-dialog.component.html'
})
export class ErrorEndpointDialogComponent implements OnInit {

    errorEndpoint: ErrorEndpoint;
    isSaving: boolean;

    services: Service[];

    headers: Header[];

    constructor(
        public activeModal: NgbActiveModal,
        private jhiAlertService: JhiAlertService,
        private errorEndpointService: ErrorEndpointService,
        private serviceService: ServiceService,
        private headerService: HeaderService,
        private eventManager: JhiEventManager,
        public components: Components
    ) {
    }

    ngOnInit() {
        this.isSaving = false;
        this.serviceService
            .query({filter: 'errorendpoint-is-null'})
            .subscribe((res) => {
                if (!this.errorEndpoint.serviceId) {
                    this.services = res.body;
                } else {
                    this.serviceService
                        .find(this.errorEndpoint.serviceId)
                        .subscribe(subRes => {
                            this.services.push(subRes.body);
                        }, (subRes) => this.onError(subRes));
                }
            }, (res) => this.onError(res.json));
        this.headerService
            .query({filter: 'errorendpoint-is-null'})
            .subscribe((res) => {
                if (!this.errorEndpoint.headerId) {
                    this.headers = res.body;
                } else {
                    this.headerService
                        .find(this.errorEndpoint.headerId)
                        .subscribe((subRes) => {
                            this.headers.push(subRes.body);
                        }, (subRes) => this.onError(subRes.json));
                }
            }, (res) => this.onError(res.json));
    }

    clear() {
        this.activeModal.dismiss('cancel');
    }

    save() {
        this.isSaving = true;
        if (this.errorEndpoint.id !== undefined) {
            this.subscribeToSaveResponse(
                this.errorEndpointService.update(this.errorEndpoint));
        } else {
            this.subscribeToSaveResponse(
                this.errorEndpointService.create(this.errorEndpoint));
        }
    }

    private subscribeToSaveResponse(result: Observable<HttpResponse<IErrorEndpoint>>) {
        result.subscribe(data => {
            if(data.ok){
                this.onSaveSuccess(data.body);
            }else{
                this.onSaveError()
            }
            }    
        )
    }

    private onSaveSuccess(result: ErrorEndpoint) {
        this.eventManager.broadcast({ name: 'errorEndpointListModification', content: 'OK'});
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
    selector: 'jhi-error-endpoint-popup',
    template: ''
})
export class ErrorEndpointPopupComponent implements OnInit, OnDestroy {

    routeSub: any;

    constructor(
        private route: ActivatedRoute,
    ) {}

    ngOnInit() {
    }

    ngOnDestroy() {
        this.routeSub.unsubscribe();
    }
}

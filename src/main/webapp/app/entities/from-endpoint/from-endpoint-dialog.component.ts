import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Observable } from 'rxjs';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { JhiEventManager, JhiAlertService } from 'ng-jhipster';
import { FormGroup, FormControl, AbstractControl } from '@angular/forms';

import { IFromEndpoint } from 'app/shared/model/from-endpoint.model';
import { IService } from 'app/shared/model/service.model';
import { IHeader } from 'app/shared/model/header.model';

import { FromEndpointService } from './from-endpoint.service';

import { ServiceService } from '../service';
import { HeaderService } from '../header';
import { EndpointType, Components } from '../../shared/camel/component-type';
import { HttpResponse } from '@angular/common/http';

@Component({
    selector: 'jhi-from-endpoint-dialog',
    templateUrl: './from-endpoint-dialog.component.html'
})
export class FromEndpointDialogComponent implements OnInit {

    fromEndpoint: IFromEndpoint;
    isSaving: boolean;

    services: IService[];

    headers: IHeader[];

    constructor(
        public activeModal: NgbActiveModal,
        private jhiAlertService: JhiAlertService,
        private fromEndpointService: FromEndpointService,
        private serviceService: ServiceService,
        private headerService: HeaderService,
        private eventManager: JhiEventManager,
        public components: Components
    ) {
    }

    ngOnInit() {
        this.isSaving = false;
        this.serviceService
            .query({filter: 'fromendpoint-is-null'})
            .subscribe((res) => {
                if (!this.fromEndpoint.serviceId) {
                    this.services = res.body;
                } else {
                    this.serviceService
                        .find(this.fromEndpoint.serviceId)
                        .subscribe((subRes: HttpResponse<IService>) => {
                            res.body.some((s) => s.id === subRes.body.id) ?
                                this.services = res.body :
                                this.services.push(subRes.body);
                        }, (subRes) => this.onError(subRes.json));
                }
            }, (res) => this.onError(res.json));
        this.headerService
            .query({filter: 'fromendpoint-is-null'})
            .subscribe((res) => {
                if (!this.fromEndpoint.headerId) {
                    this.headers = res.body;
                } else {
                    this.headerService
                        .find(this.fromEndpoint.headerId)
                        .subscribe((subRes: HttpResponse<IHeader>) => {
                            res.body.some((s) => s.id === subRes.body.id) ?
                                this.services = res.body :
                                this.services.push(subRes.body);
                        }, (subRes) => this.onError(subRes.json));
                }
            }, (res) => this.onError(res.json));
    }
    clear() {
        this.activeModal.dismiss('cancel');
    }

    save() {
        this.isSaving = true;
        if (this.fromEndpoint.id !== undefined) {
            this.subscribeToSaveResponse(
                this.fromEndpointService.update(this.fromEndpoint));
        } else {
            this.subscribeToSaveResponse(
                this.fromEndpointService.create(this.fromEndpoint));
        }
    }

    private subscribeToSaveResponse(result: Observable<HttpResponse<IFromEndpoint>>) {
        result.subscribe(data => {
            if(data.ok){
                this.onSaveSuccess(data.body);
            }else{
                this.onSaveError()
            }
            }    
        )
    }

    private onSaveSuccess(result: IFromEndpoint) {
        this.eventManager.broadcast({ name: 'fromEndpointListModification', content: 'OK'});
        this.isSaving = false;
        this.activeModal.dismiss(result);
    }

    private onSaveError() {
        this.isSaving = false;
    }

    private onError(error: any) {
        this.jhiAlertService.error(error.message, null, null);
    }

    trackServiceById(index: number, item: IService) {
        return item.id;
    }

    trackHeaderById(index: number, item: IHeader) {
        return item.id;
    }
}

@Component({
    selector: 'jhi-from-endpoint-popup',
    template: ''
})
export class FromEndpointPopupComponent implements OnInit, OnDestroy {

    routeSub: any;

    constructor(
        private route: ActivatedRoute
    ) {}

    ngOnInit() {
        
    }

    ngOnDestroy() {
        this.routeSub.unsubscribe();
    }
}

import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient, HttpResponse, HttpHeaders } from '@angular/common/http';

import { Observable } from 'rxjs';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { JhiEventManager, JhiAlertService } from 'ng-jhipster';

import { IService, Service } from 'app/shared/model/service.model';
import { IServiceKeys, ServiceKeys } from 'app/shared/model/service-keys.model';
import { ServiceKeysService } from './service-keys.service';
import { ServiceService } from '../service';

@Component({
    selector: 'jhi-service-keys-dialog',
    templateUrl: './service-keys-dialog.component.html'
})
export class ServiceKeysDialogComponent implements OnInit {

    serviceKeys: ServiceKeys;
    isSaving: boolean;

    services: Service[];

    constructor(
        public activeModal: NgbActiveModal,
        private jhiAlertService: JhiAlertService,
        private serviceKeysService: ServiceKeysService,
        private serviceService: ServiceService,
        private eventManager: JhiEventManager
    ) {
    }

    ngOnInit() {
        this.isSaving = false;
        this.serviceService.query()
            .subscribe(res => { this.services = res.body; }, res => this.onError(res.body));
    }

    clear() {
        this.activeModal.dismiss('cancel');
    }

    save(closePopup: boolean) {
        this.isSaving = true;
        if (this.serviceKeys.id !== undefined) {
            this.subscribeToSaveResponse(
                this.serviceKeysService.update(this.serviceKeys), closePopup);
        } else {
            this.subscribeToSaveResponse(
                this.serviceKeysService.create(this.serviceKeys), closePopup);
        }
    }

    private subscribeToSaveResponse(result: Observable<HttpResponse<IServiceKeys>>,closePopup) {
        result.subscribe(data => {
            if(data.ok){
                this.onSaveSuccess(data.body,closePopup);
            }else{
                this.onSaveError()
            }
            }    
        )
    }
    
    private onSaveSuccess(result: ServiceKeys, closePopup: boolean) {
        this.eventManager.broadcast({ name: 'serviceKeysListModification', content: 'OK'});
        this.isSaving = false;
        if (closePopup) {
            this.activeModal.dismiss(result);
        }
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
}

@Component({
    selector: 'jhi-service-keys-popup',
    template: ''
})
export class ServiceKeysPopupComponent implements OnInit, OnDestroy {

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

import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Response } from '@angular/http';

import { Observable } from 'rxjs/Observable';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { JhiEventManager, JhiAlertService } from 'ng-jhipster';

import { Service } from './service.model';
import { ServicePopupService } from './service-popup.service';
import { ServiceService } from './service.service';
import { ServiceKeysService } from '../service-keys/service-keys.service';
import { ServiceKeys, RequiredServiceKey } from '../service-keys';
import { ResponseWrapper } from '../../shared';

@Component({
    selector: 'jhi-service-dialog',
    templateUrl: './service-dialog.component.html'
})
export class ServiceDialogComponent implements OnInit {
    public serviceKeys: Array<ServiceKeys> = [];
    public service: Service;
    public servicesNames: Array<string> = [];
    public isSaving: boolean;
    public serviceKeysKeys: Array<string> = [];
    public listVal: Array<String> = ['com.mysql.jdbc.Driver', 'org.postgresql.Driver'];
    public disableType: boolean;
    public typeServices: string[] = ['JDBC Connection', 'SonicMQ Connection', 'ActiveMQ Connection', 'MQ Connection'];
    private requiredServiceKey: Array<RequiredServiceKey> = [];
    private requiredType: RequiredServiceKey;
    private serviceKeysRemoveList: Array<ServiceKeys> = [];

    constructor(
        public activeModal: NgbActiveModal,
        private serviceService: ServiceService,
        private serviceKeysService: ServiceKeysService,
        private eventManager: JhiEventManager,
        private jhiAlertService: JhiAlertService,
        private route: ActivatedRoute,
        private router: Router
    ) {
    }

    ngOnInit() {
        this.isSaving = false;
        this.addRequiredServiceKeys();
        this.serviceService.query().subscribe(
            (res: ResponseWrapper) => {
                this.servicesNames = res.json.map((s) => s.name)
            },
            (res: ResponseWrapper) => this.onError(res.json)
        );
        if (this.route.fragment['value'] && this.route.fragment['value'] !== 'clone') {
            this.service.type = this.typeServices.find((st) => st === this.route.fragment['value']);
            this.disableType = this.typeServices.some((st) => st === this.route.fragment['value']);
        }

        this.loadServiceKeys(this.route.fragment['value'] === 'clone');
    }

    changeType(cloneHeader: boolean) {
        if (typeof this.requiredType !== 'undefined') {
            this.serviceKeysRemoveList = [];
            this.requiredType.serviceKeys.forEach((rsk) => {
                this.serviceKeysRemoveList.push(this.serviceKeys.splice(this.serviceKeys.indexOf(
                    this.serviceKeys.find((sk) => (rsk.serviceKeyName === sk.key && sk.id !== undefined))
                ), 1)[0])
            });
        }

        this.requiredType = this.requiredServiceKey.find((x) => x.name === this.service.type);
        const requiredServiceKeys =  new Array<ServiceKeys>();
        this.requiredType.serviceKeys.forEach((sk) => {
            let ersk = this.serviceKeys.find((s) => s.key === sk.serviceKeyName);
            let rsk = new ServiceKeys();
            if (ersk instanceof ServiceKeys) {
                rsk = ersk;
                this.serviceKeys.splice(this.serviceKeys.indexOf(ersk), 1);
            }
            rsk.id = cloneHeader ? null : rsk.id;
            rsk.key = sk.serviceKeyName;
            rsk.valueType = sk.valueType;
            rsk.placeholder = sk.placeholder;
            rsk.isRequired = true;
            requiredServiceKeys.push(rsk);
        });
        this.serviceKeys.unshift(...requiredServiceKeys);
        this.mapServiceKeysKeys();
    }

    addServiceKeys() {
        const newServiceKeys = new ServiceKeys();
        this.serviceKeys.push(newServiceKeys);
        this.mapServiceKeysKeys();
    }

    removeServiceKeys(i: number) {
        this.serviceKeys.splice(i, 1);
        this.mapServiceKeysKeys();
        if (this.serviceKeys.length === 0) {
            this.addServiceKeys();
        }
    }

    clear() {
        this.activeModal.dismiss('cancel');
    }

    save(closePopup: boolean) {
        this.isSaving = true;
        if (this.service.id !== undefined) {
            this.subscribeToSaveResponse(
                this.serviceService.update(this.service), closePopup);
        } else {
            this.subscribeToSaveResponse(
                this.serviceService.create(this.service), closePopup);
        }
    }

    deleteServiceKeys(serviceKey) {
        this.serviceKeysService.delete(serviceKey.id).subscribe(() => {
            this.removeServiceKeys(this.serviceKeys.indexOf(serviceKey));
        })
    }

    navigateToService() {
        this.router.navigate(['/service']);
        setTimeout(() => {
            this.activeModal.close();
        }, 0);
    }

    navigateToServiceDetail(serviceId: number) {
        this.router.navigate(['/service', serviceId]);
        setTimeout(() => {
            this.activeModal.close();
        }, 0);
    }

    private loadServiceKeys(cloneHeader: boolean) {
        if (this.service.id) {
            this.serviceKeysService.query().subscribe((res) => {
                this.serviceKeys = res.json.filter((sk) => sk.serviceId === this.service.id);
                this.changeType(cloneHeader);
                this.service.id = cloneHeader ? null : this.service.id;
            });
        }else if (this.service.type) {
            this.changeType(cloneHeader);
            this.service.id = cloneHeader ? null : this.service.id;
        }
    }

    private mapServiceKeysKeys() {
        if (typeof this.serviceKeys !== 'undefined') {
            this.serviceKeysKeys = this.serviceKeys.map((sk) => sk.key);
            this.serviceKeysKeys = this.serviceKeysKeys.filter((k) => k !== undefined);
        }
    }

    private subscribeToSaveResponse(result: Observable<Service>, closePopup: boolean) {
        result.subscribe((res: Service) =>
            this.onSaveSuccess(res, closePopup), (res: Response) => this.onSaveError());
    }

    private onSaveSuccess(result: Service, closePopup: boolean) {
        this.eventManager.broadcast({ name: 'serviceListModification', content: 'OK'});
        this.eventManager.broadcast({ name: 'serviceKeysUpdated', content: result });
        this.eventManager.broadcast({name: 'serviceModified', content: result.id});
        this.isSaving = false;
        this.activeModal.dismiss(result);

        this.serviceKeysRemoveList.forEach((skrl) => {
            this.serviceKeysService.delete(skrl.id).subscribe();
        });

        this.serviceKeys.forEach((serviceKey) => {
            serviceKey.serviceId = result.id;
            if (serviceKey.id) {
                this.serviceKeysService.update(serviceKey).subscribe((sk) => {
                    serviceKey = sk;
                });
            } else {
                this.serviceKeysService.create(serviceKey).subscribe((sk) => {
                    serviceKey = sk;
                })
            }
        });
        this.serviceKeysService.update(this.serviceKeys[0])
    }
    private onError(error: any) {
        this.jhiAlertService.error(error.message, null, null);
    }
    private onSaveError() {
        this.isSaving = false;
    }

    private addRequiredServiceKeys() {
        this.requiredServiceKey.push(
            {
                name: 'JDBC Connection',
                serviceKeys: [
                    { serviceKeyName: 'url', valueType: 'text', placeholder: 'jdbc:mysql://localhost/dbname' },
                    { serviceKeyName: 'username', valueType: 'text', placeholder: 'admin' },
                    { serviceKeyName: 'password', valueType: 'password', placeholder: '' },
                    { serviceKeyName: 'driver', valueType: 'list', placeholder: '' }
                ]
            },
            {
                name: 'SonicMQ Connection',
                serviceKeys: [
                    { serviceKeyName: 'url', valueType: 'text', placeholder: 'tcp://localhost:2506' },
                    { serviceKeyName: 'username', valueType: 'text', placeholder: 'Administrator' },
                    { serviceKeyName: 'password', valueType: 'password', placeholder: '' }
                ]
            },
            {
                name: 'ActiveMQ Connection',
                serviceKeys: [
                    { serviceKeyName: 'url', valueType: 'text', placeholder: 'tcp://localhost:61616' }
                ]
            },
            {
                name: 'MQ Connection',
                serviceKeys: [
                    { serviceKeyName: 'url', valueType: 'text', placeholder: '' }
                ]
            },
        )
    }

}

@Component({
    selector: 'jhi-service-popup',
    template: ''
})
export class ServicePopupComponent implements OnInit, OnDestroy {

    routeSub: any;

    constructor(
        private route: ActivatedRoute,
        private servicePopupService: ServicePopupService
    ) {}

    ngOnInit() {
        this.routeSub = this.route.params.subscribe((params) => {
            if ( params['id'] ) {
                this.servicePopupService
                    .open(ServiceDialogComponent as Component, params['id']);
            } else {
                this.servicePopupService
                    .open(ServiceDialogComponent as Component);
            }
        });
    }

    ngOnDestroy() {
        this.routeSub.unsubscribe();
    }
}

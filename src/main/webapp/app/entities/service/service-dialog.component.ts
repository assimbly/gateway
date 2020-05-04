import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpResponse, HttpHeaders } from '@angular/common/http';

import { Observable } from 'rxjs';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { JhiEventManager, JhiAlertService } from 'ng-jhipster';

import { IService, Service } from 'app/shared/model/service.model';
import { IServiceKeys, ServiceKeys } from 'app/shared/model/service-keys.model';

import { ServiceService } from './service.service';
import { ServiceKeysService } from '../service-keys/service-keys.service';
import { RequiredServiceKey } from '../service-keys';
import { ServicePopupService } from 'app/entities/service/service-popup.service';

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
    public listVal: Array<String> = [
        'com.mysql.jdbc.Driver',
        'oracle.jdbc.driver.OracleDriver',
        'org.postgresql.Driver',
        'com.microsoft.sqlserver.jdbc.SQLServerDriver'
    ];
    public disableType: boolean;
    public serviceType: string;
    public typeServices: string[] = ['JDBC Connection', 'SonicMQ Connection', 'ActiveMQ Connection','AmazonMQ Connection', 'MQ Connection'];
    private requiredServiceKey: Array<RequiredServiceKey> = [];
    private requiredType: RequiredServiceKey;
    private serviceKeysRemoveList: Array<ServiceKeys> = [];

    constructor(
        public activeModal: NgbActiveModal,
        protected serviceService: ServiceService,
        protected serviceKeysService: ServiceKeysService,
        protected eventManager: JhiEventManager,
        protected jhiAlertService: JhiAlertService,
        protected activatedRoute: ActivatedRoute,
        protected router: Router
    ) {}

    ngOnInit() {
        this.isSaving = false;
        this.addRequiredServiceKeys();
        this.serviceService.query().subscribe(
            res => {
                this.servicesNames = res.body.map(s => s.name);
            },
            res => this.onError(res.body)
        );
        if (this.activatedRoute.fragment['value'] !== 'clone' || this.serviceType === null) {
            this.service.type = this.typeServices.find(st => st === this.serviceType);
            this.disableType = this.typeServices.some(st => st === this.serviceType);
        }

        if (this.activatedRoute.fragment['value'] === 'clone') {
            this.loadServiceKeys(true);
        } else {
            this.loadServiceKeys(false);
        }
    }

    changeType(cloneHeader: boolean) {
        if (typeof this.requiredType !== 'undefined') {
            this.serviceKeysRemoveList = [];
            this.requiredType.serviceKeys.forEach(rsk => {
                this.serviceKeysRemoveList.push(
                    this.serviceKeys.splice(
                        this.serviceKeys.indexOf(this.serviceKeys.find(sk => rsk.serviceKeyName === sk.key && sk.id !== undefined)),
                        1
                    )[0]
                );
            });
        }

        this.requiredType = this.requiredServiceKey.find(x => x.name === this.service.type);

        const requiredServiceKeys = new Array<ServiceKeys>();
        this.requiredType.serviceKeys.forEach(sk => {
            let ersk = this.serviceKeys.find(s => s.key === sk.serviceKeyName);
            let rsk = new ServiceKeys();
            if (typeof ersk !== 'undefined') {
                if (ersk.value !== '') {
                    rsk = ersk;
                    this.serviceKeys.splice(this.serviceKeys.indexOf(ersk), 1);
                }
            }
            rsk.id = cloneHeader ? null : rsk.id;
            rsk.key = sk.serviceKeyName;
            rsk.valueType = sk.valueType;
            rsk.placeholder = sk.placeholder;
            rsk.isRequired = sk.isRequired;
            requiredServiceKeys.push(rsk);
        });
        this.serviceKeys.unshift(...requiredServiceKeys);
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

    previousState() {
        window.history.back();
    }

    save(closePopup: boolean) {
        this.isSaving = true;
        if (this.service.id !== undefined) {
            this.subscribeToSaveResponse(this.serviceService.update(this.service));
        } else {
            this.subscribeToSaveResponse(this.serviceService.create(this.service));
        }
    }

    deleteServiceKeys(serviceKey) {
        this.serviceKeysService.delete(serviceKey.id).subscribe(() => {
            this.removeServiceKeys(this.serviceKeys.indexOf(serviceKey));
        });
    }

    clear() {
        console.log('clear');
        this.activeModal.dismiss('cancel');
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
            this.serviceKeysService.query().subscribe(res => {
                this.serviceKeys = res.body.filter(sk => sk.serviceId === this.service.id);
                this.changeType(cloneHeader);
                this.service.id = cloneHeader ? null : this.service.id;
            });
        } else if (this.service.type) {
            this.changeType(cloneHeader);
            this.service.id = cloneHeader ? null : this.service.id;
        }
    }

    private mapServiceKeysKeys() {
        if (typeof this.serviceKeys !== 'undefined') {
            this.serviceKeysKeys = this.serviceKeys.map(sk => sk.key);
            this.serviceKeysKeys = this.serviceKeysKeys.filter(k => k !== undefined);
        }
    }

    private subscribeToSaveResponse(result: Observable<HttpResponse<IService>>) {
        result.subscribe(data => {
            if (data.ok) {
                this.onSaveSuccess(data.body, true);
            } else {
                this.onSaveError();
            }
        });
    }

    private onSaveSuccess(result: Service, closePopup: boolean) {
        this.eventManager.broadcast({ name: 'serviceListModification', content: 'OK' });
        this.eventManager.broadcast({ name: 'serviceKeysUpdated', content: result });
        this.eventManager.broadcast({ name: 'serviceModified', content: result.id });
        this.isSaving = false;
        this.activeModal.dismiss(result);

        this.serviceKeysRemoveList.forEach(skrl => {
            this.serviceKeysService.delete(skrl.id).subscribe();
        });

        this.serviceKeys.forEach(serviceKey => {
            serviceKey.serviceId = result.id;
            if (serviceKey.id) {
                this.serviceKeysService.update(serviceKey).subscribe(sk => {
                    serviceKey = sk.body;
                });
            } else {
                this.serviceKeysService.create(serviceKey).subscribe(sk => {
                    serviceKey = sk.body;
                });
            }
        });
        this.serviceKeysService.update(this.serviceKeys[0]);
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
                    { serviceKeyName: 'url', valueType: 'text', placeholder: 'Example jdbc:mysql://localhost/dbname', isRequired: true },
                    { serviceKeyName: 'username', valueType: 'text', placeholder: '', isRequired: true },
                    { serviceKeyName: 'password', valueType: 'password', placeholder: '', isRequired: true },
                    { serviceKeyName: 'driver', valueType: 'list', placeholder: '', isRequired: true }
                ]
            },
            {
                name: 'SonicMQ Connection',
                serviceKeys: [
                    { serviceKeyName: 'url', valueType: 'text', placeholder: 'Example tcp://localhost:2506', isRequired: true },
                    { serviceKeyName: 'username', valueType: 'text', placeholder: 'Example Administrator', isRequired: true },
                    { serviceKeyName: 'password', valueType: 'password', placeholder: '', isRequired: true }
                ]
            },
            {
                name: 'ActiveMQ Connection',
                serviceKeys: [
                    { serviceKeyName: 'url', valueType: 'text', placeholder: 'Example tcp://localhost:61616', isRequired: true }
                    /*,
                    { serviceKeyName: 'username', valueType: 'text', placeholder: 'user', isRequired: false },
                    { serviceKeyName: 'password', valueType: 'password', placeholder: '',isRequired: false }*/
                ]
            },
            {
                name: 'AmazonMQ Connection',
                serviceKeys: [
                    { serviceKeyName: 'url', valueType: 'text', placeholder: 'Example ssl://servername:61617', isRequired: true },
                    { serviceKeyName: 'username', valueType: 'text', placeholder: 'user', isRequired: true },
                    { serviceKeyName: 'password', valueType: 'password', placeholder: '', isRequired: true }
                ]
            },
            {
                name: 'MQ Connection',
                serviceKeys: [
                    { serviceKeyName: 'url', valueType: 'text', placeholder: 'tcp://localhost:61616', isRequired: true },
                    { serviceKeyName: 'username', valueType: 'text', placeholder: 'user', isRequired: false },
                    { serviceKeyName: 'password', valueType: 'password', placeholder: '', isRequired: false }
                ]
            }
        );
    }
}

@Component({
    selector: 'jhi-service-popup',
    template: ''
})
export class ServicePopupComponent implements OnInit, OnDestroy {
    routeSub: any;

    constructor(private route: ActivatedRoute, private servicePopupService: ServicePopupService) {}

    ngOnInit() {
        this.routeSub = this.route.params.subscribe(params => {
            if (params['id']) {
                this.servicePopupService.open(ServiceDialogComponent as Component, params['id']);
            } else {
                this.servicePopupService.open(ServiceDialogComponent as Component);
            }
        });
    }

    ngOnDestroy() {
        this.routeSub.unsubscribe();
    }
}

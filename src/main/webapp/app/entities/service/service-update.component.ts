import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpResponse, HttpHeaders } from '@angular/common/http';

import { Observable } from 'rxjs';
import { JhiEventManager, JhiAlertService } from 'ng-jhipster';
import { IService, Service } from 'app/shared/model/service.model';
import { IServiceKeys, ServiceKeys } from 'app/shared/model/service-keys.model';
import { ServiceService } from './service.service';
import { ServiceKeysService } from '../service-keys/service-keys.service';
import { RequiredServiceKey } from '../service-keys';
import { HttpErrorResponse } from "@angular/common/http";

@Component({
    selector: 'jhi-service-update',
    templateUrl: './service-update.component.html'
})
export class ServiceUpdateComponent implements OnInit {
    service: IService;
    isSaving: boolean;
    private serviceKeys: Array<ServiceKeys> = [];
    servicesNames: Array<String> = [];
    serviceKeysKeys: Array<String> = [];
    listVal: Array<String> = ['com.mysql.jdbc.Driver', 'oracle.jdbc.driver.OracleDriver', 'org.postgresql.Driver','com.microsoft.sqlserver.jdbc.SQLServerDriver'];
    public disableType: boolean;
    public typeServices: string[] = ['JDBC Connection', 'SonicMQ Connection', 'ActiveMQ Connection', 'MQ Connection'];
    private requiredServiceKey: Array<RequiredServiceKey> = [];
    private requiredType: RequiredServiceKey;
private serviceKeysRemoveList: Array<ServiceKeys> = [];

    constructor(
		protected serviceService: ServiceService,
        protected serviceKeysService: ServiceKeysService, 
        protected eventManager: JhiEventManager,
        protected jhiAlertService: JhiAlertService,
        protected activatedRoute: ActivatedRoute,
        protected router: Router) {}

    ngOnInit() {
        this.isSaving = false;
        this.addRequiredServiceKeys();
        this.activatedRoute.data.subscribe(({ service }) => {
            this.service = service;
        });
        this.serviceService.query().subscribe(
                (res) => {
                    this.servicesNames = res.body.map((s) => s.name)
                },
                (res) => this.onError(res.body)
        );        
        if (this.activatedRoute.fragment['value'] && this.activatedRoute.fragment['value'] !== 'clone') {
            this.service.type = this.typeServices.find((st) => st === this.activatedRoute.fragment['value']);
            this.disableType = this.typeServices.some((st) => st === this.activatedRoute.fragment['value']);
        }

        if (this.activatedRoute.fragment['value'] === 'clone') {
            this.loadServiceKeys(true);
        }else{
            this.loadServiceKeys(false);
        }
        
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
        
        this.requiredType = this.requiredServiceKey.find(x => x.name === this.service.type);
        
        const requiredServiceKeys =  new Array<ServiceKeys>();
        this.requiredType.serviceKeys.forEach((sk) => {
            let ersk = this.serviceKeys.find(s => s.key === sk.serviceKeyName);
            let rsk = new ServiceKeys();
            if(typeof ersk !== 'undefined'){
                if (ersk.value !== '') {
                    rsk = ersk;
                    this.serviceKeys.splice(this.serviceKeys.indexOf(ersk), 1);
                }
            }
            rsk.id = cloneHeader ? null : rsk.id;
            rsk.key = sk.serviceKeyName;
            rsk.valueType = sk.valueType;
            rsk.placeholder = sk.placeholder;
            rsk.isRequired = true;
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

    save() {
        this.isSaving = true;
        if (this.service.id) {            
            this.subscribeToSaveResponse(this.serviceService.update(this.service));
        } else {
            this.subscribeToSaveResponse(this.serviceService.create(this.service));
        }
    }

    protected subscribeToSaveResponse(result: Observable<HttpResponse<IService>>) {
        result.subscribe((res: HttpResponse<IService>) => this.onSaveSuccess(res.body), (res: HttpErrorResponse) => this.onSaveError());
    }

    protected onSaveSuccess(result: IService) {
        this.eventManager.broadcast({ name: 'serviceListModification', content: 'OK'});
        this.eventManager.broadcast({ name: 'serviceKeysUpdated', content: result });
        this.eventManager.broadcast({name: 'serviceModified', content: result.id});
        this.isSaving = false;

        this.serviceKeysRemoveList.forEach((skrl) => {
            this.serviceKeysService.delete(skrl.id).subscribe();
        });

        this.serviceKeys.forEach((serviceKey) => {
            serviceKey.serviceId = result.id;
            if (serviceKey.id) {
                this.serviceKeysService.update(serviceKey).subscribe((sk) => {
                    serviceKey = sk.body;
                });
            } else {
                this.serviceKeysService.create(serviceKey).subscribe((sk) => {
                    serviceKey = sk.body;
                })
            }
        });
        this.serviceKeysService.update(this.serviceKeys[0])

        this.navigateToService();
    }
    
    private onError(error: any) {
        this.jhiAlertService.error(error.message, null, null);
    }

    protected onSaveError() {
        this.isSaving = false;
    }

    deleteServiceKeys(serviceKey) {
        this.serviceKeysService.delete(serviceKey.id).subscribe(() => {
            this.removeServiceKeys(this.serviceKeys.indexOf(serviceKey));
        })
    }

    navigateToService() {
        this.router.navigate(['/service']);        
    }

    navigateToServiceDetail(serviceId: number) {
        this.router.navigate(['/service', serviceId]);
        setTimeout(() => {
            this.previousState();
        }, 0);
    }

    private loadServiceKeys(cloneHeader: boolean) {
        if (this.service.id) {
            this.serviceKeysService.query().subscribe((res) => {
                this.serviceKeys = res.body.filter((sk) => sk.serviceId === this.service.id);
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

    private addRequiredServiceKeys() {
        this.requiredServiceKey.push(
            {
                name: 'JDBC Connection',
                serviceKeys: [
                    { serviceKeyName: 'url', valueType: 'text', placeholder: 'Example jdbc:mysql://localhost/dbname' },
                    { serviceKeyName: 'username', valueType: 'text', placeholder: '' },
                    { serviceKeyName: 'password', valueType: 'password', placeholder: '' },
                    { serviceKeyName: 'driver', valueType: 'list', placeholder: '' }
                ]
            },
            {
                name: 'SonicMQ Connection',
                serviceKeys: [
                    { serviceKeyName: 'url', valueType: 'text', placeholder: 'Example tcp://localhost:2506' },
                    { serviceKeyName: 'username', valueType: 'text', placeholder: 'Example Administrator' },
                    { serviceKeyName: 'password', valueType: 'password', placeholder: '' }
                ]
            },
            {
                name: 'ActiveMQ Connection',
                serviceKeys: [
                    { serviceKeyName: 'url', valueType: 'text', placeholder: 'Example tcp://localhost:61616' }
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

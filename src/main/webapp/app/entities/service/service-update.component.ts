import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';

import { Observable } from 'rxjs';
import { EventManager, EventWithContent } from 'app/core/util/event-manager.service';
import { AlertService } from 'app/core/util/alert.service';
import { IService } from 'app/shared/model/service.model';
import { ServiceKeys } from 'app/shared/model/service-keys.model';
import { ServiceService } from './service.service';
import { ServiceKeysService } from '../service-keys/service-keys.service';
import { RequiredServiceKey } from '../service-keys/service-keys.component';

import { Services } from '../../shared/camel/service-connections';

@Component({
  selector: 'jhi-service-update',
  templateUrl: './service-update.component.html',
})
export class ServiceUpdateComponent implements OnInit {
  service: IService;
  isSaving: boolean;
  serviceKeys: Array<ServiceKeys> = [];
  servicesNames: Array<string> = [];
  serviceKeysKeys: Array<string> = [];

  public driversList: Array<string> = this.services.driversList;
  jmsProvidersList: Array<string> = ['ActiveMQ Artemis', 'ActiveMQ Classic', 'AMQ'];

  public disableType: boolean;

  requiredServiceKey: Array<RequiredServiceKey> = [];
  requiredType: RequiredServiceKey;
  serviceKeysRemoveList: Array<ServiceKeys> = [];

  constructor(
    protected serviceService: ServiceService,
    protected serviceKeysService: ServiceKeysService,
    public services: Services,
    protected eventManager: EventManager,
    protected alertService: AlertService,
    protected activatedRoute: ActivatedRoute,
    protected router: Router
  ) {}

  ngOnInit() {
    this.isSaving = false;
    this.addRequiredServiceKeys();
    this.activatedRoute.data.subscribe(({ service }) => {
      this.service = service;
    });
    this.serviceService.query().subscribe(
      res => {
        this.servicesNames = res.body.map(s => s.name);
      },
      res => this.onError(res.body)
    );
    if (this.activatedRoute.fragment['value'] && this.activatedRoute.fragment['value'] !== 'clone') {
      this.service.type = this.services.connectionsList.find(st => st === this.activatedRoute.fragment['value']);
      this.disableType = this.services.connectionsList.some(st => st === this.activatedRoute.fragment['value']);
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
      const ersk = this.serviceKeys.find(s => s.key === sk.serviceKeyName);
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

  save() {
    this.isSaving = true;
    if (this.service.id) {
      this.subscribeToSaveResponse(this.serviceService.update(this.service));
    } else {
      this.subscribeToSaveResponse(this.serviceService.create(this.service));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IService>>) {
    result.subscribe(
      (res: HttpResponse<IService>) => this.onSaveSuccess(res.body),
      (res: HttpErrorResponse) => this.onSaveError()
    );
  }

  protected onSaveSuccess(result: IService) {
    this.eventManager.broadcast(new EventWithContent('serviceListModification', 'OK'));
    
    this.isSaving = false;

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

    this.navigateToService();
  }

  private onError(error: any) {
        this.alertService.addAlert({
		  type: 'danger',
		  message: error.message,
		});
  }

  protected onSaveError() {
    this.isSaving = false;
  }

  deleteServiceKeys(serviceKey) {
    this.serviceKeysService.delete(serviceKey.id).subscribe(() => {
      this.removeServiceKeys(this.serviceKeys.indexOf(serviceKey));
    });
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

  private addRequiredServiceKeys() {
    this.requiredServiceKey = this.services.keysList;
  }
}

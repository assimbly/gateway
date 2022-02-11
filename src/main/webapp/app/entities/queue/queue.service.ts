import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpHeaders } from '@angular/common/http';
import { Observable, Observer } from 'rxjs';

import { ApplicationConfigService } from 'app/core/config/application-config.service';

import { createRequestOption } from 'app/shared/util/request-util';

import { Router } from '@angular/router';
import { WindowRef } from 'app/shared';

import { IQueue } from 'app/shared/model/queue.model';
import { IRootQueueAddress } from 'app/shared/model/address.model';

import { BrokerService } from 'app/entities/broker/broker.service';
import { IBroker } from 'app/shared/model/broker.model';

type EntityResponseType = HttpResponse<IQueue>;
type EntityArrayResponseType = HttpResponse<IQueue[]>;

@Injectable({ providedIn: 'root' })
export class QueueService {
  public queuesResourceUrl = this.applicationConfigService +'api/queues';
  public brokersResourceUrl = this.applicationConfigService +'api/brokers';

  brokerType: string;

  constructor(protected http: HttpClient, protected router: Router, protected $window: WindowRef, private applicationConfigService: ApplicationConfigService, protected brokerService: BrokerService) {   
  }

  create(queue: IQueue): Observable<EntityResponseType> {
    return this.http.post<IQueue>(this.queuesResourceUrl, queue, { observe: 'response' });
  }

  update(queue: IQueue): Observable<EntityResponseType> {
    return this.http.put<IQueue>(this.queuesResourceUrl, queue, { observe: 'response' });
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http.get<IQueue>(`${this.queuesResourceUrl}/${id}`, { observe: 'response' });
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<IQueue[]>(this.queuesResourceUrl, { params: options, observe: 'response' });
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.queuesResourceUrl}/${id}`, { observe: 'response' });
  }

  getAllQueues(brokerType: string): Observable<HttpResponse<IRootQueueAddress>> {
    if (brokerType != null && brokerType != '') {
      return this.http.get<IRootQueueAddress>(`${this.brokersResourceUrl}/${brokerType}/queues`, {
        headers: new HttpHeaders({ PlaceholderReplacement: 'true', Accept: 'application/json' }),
        observe: 'response',
      });
    } else {
      return null;
    }
  }

  getBrokers(): Observable<HttpResponse<IBroker[]>> {
    return this.http.get<IBroker[]>(`${this.brokersResourceUrl}`, {
      headers: new HttpHeaders({ PlaceholderReplacement: 'true', Accept: 'application/json' }),
      observe: 'response',
    });
  }

  createQueue(name: string, brokerType: string): Observable<HttpResponse<string>> {
    return this.http.post(`${this.brokersResourceUrl}/${brokerType}/queue/${name}`, null, {
      observe: 'response',
      responseType: 'text',
    });
  }

  deleteQueue(name: string, brokerType: string): Observable<HttpResponse<string>> {
    return this.http.delete(`${this.brokersResourceUrl}/${brokerType}/queue/${name}`, {
      observe: 'response',
      responseType: 'text',
    });
  }

  clearQueue(name: string, brokerType: string): Observable<HttpResponse<string>> {
    return this.http.post(`${this.brokersResourceUrl}/${brokerType}/queue/${name}/clear`, null, {
      observe: 'response',
      responseType: 'text',
    });
  }

}

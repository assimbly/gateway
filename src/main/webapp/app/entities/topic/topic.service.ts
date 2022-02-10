import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpHeaders } from '@angular/common/http';
import { Observable, Observer, Subscription } from 'rxjs';

import { SERVER_API_URL } from 'app/app.constants';
import { createRequestOption } from 'app/shared/util/request-util';

import { Router } from '@angular/router';
import { WindowRef } from 'app/shared';

import { ITopic } from 'app/shared/model/topic.model';
import { IAddress, IRootTopicAddresses, ITopicAddresses } from 'app/shared/model/address.model';

import * as SockJS from 'sockjs-client';
import * as Stomp from 'webstomp-client';

import { BrokerService } from 'app/entities/broker/broker.service';
import { IBroker } from 'app/shared/model/broker.model';

type EntityResponseType = HttpResponse<ITopic>;
type EntityArrayResponseType = HttpResponse<ITopic[]>;

type AddressesEntityResponseType = HttpResponse<ITopicAddresses>;
type AddressEntityArrayResponseType = HttpResponse<IAddress[]>;

@Injectable({ providedIn: 'root' })
export class TopicService {
  public topicsResourceUrl = SERVER_API_URL + 'api/topics';
  public brokersResourceUrl = SERVER_API_URL + 'api/brokers';

  stompClient = null;
  subscriber = null;
  connection: Promise<any>;
  connectedPromise: any;
  listener: Observable<any>;
  listenerObserver: Observer<any>;
  alreadyConnectedOnce = false;
  private subscription: Subscription;

  private gatewayid = 1;
  private brokerid = 1;

  brokerType: string;

  constructor(protected http: HttpClient, protected router: Router, protected $window: WindowRef, protected brokerService: BrokerService) {
    this.connection = this.createConnection();
    this.listener = this.createListener();
  }

  create(topic: ITopic): Observable<EntityResponseType> {
    return this.http.post<ITopic>(this.topicsResourceUrl, topic, { observe: 'response' });
  }

  update(topic: ITopic): Observable<EntityResponseType> {
    return this.http.put<ITopic>(this.topicsResourceUrl, topic, { observe: 'response' });
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http.get<ITopic>(`${this.topicsResourceUrl}/${id}`, { observe: 'response' });
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<ITopic[]>(this.topicsResourceUrl, { params: options, observe: 'response' });
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.topicsResourceUrl}/${id}`, { observe: 'response' });
  }

  getAllTopics(brokerType: string): Observable<HttpResponse<IRootTopicAddresses>> {
    return this.http.get<IRootTopicAddresses>(`${this.brokersResourceUrl}/${brokerType}/topics`, {
      headers: new HttpHeaders({ PlaceholderReplacement: 'true', Accept: 'application/json' }),
      observe: 'response',
    });
  }

  getBrokers(): Observable<HttpResponse<IBroker[]>> {
    return this.http.get<IBroker[]>(`${this.brokersResourceUrl}`, {
      headers: new HttpHeaders({ PlaceholderReplacement: 'true', Accept: 'application/json' }),
      observe: 'response',
    });
  }

  createTopic(name: string, brokerType: string): Observable<HttpResponse<string>> {
    return this.http.post(`${this.brokersResourceUrl}/${brokerType}/topic/${name}`, null, {
      observe: 'response',
      responseType: 'text',
    });
  }

  deleteTopic(name: string, brokerType: string): Observable<HttpResponse<string>> {
    return this.http.delete(`${this.brokersResourceUrl}/${brokerType}/topic/${name}`, {
      observe: 'response',
      responseType: 'text',
    });
  }

  clearTopic(name: string, brokerType: string): Observable<HttpResponse<string>> {
    return this.http.post(`${this.brokersResourceUrl}/${brokerType}/topic/${name}/clear`, null, {
      observe: 'response',
      responseType: 'text',
    });
  }

  connect() {
    if (this.connectedPromise === null) {
      this.connection = this.createConnection();
    }

    // building absolute path so that websocket doesn't fail when deploying with a context path
    const loc = this.$window.nativeWindow.location;

    let url;

    if (loc.host === 'localhost:9000') {
      // allow websockets on dev
      url = '//localhost:8080' + loc.pathname + 'websocket/alert';
    } else {
      url = '//' + loc.host + loc.pathname + 'websocket/alert';
    }

    const socket = new SockJS(url);
    this.stompClient = Stomp.over(socket);

    const headers = {};

    this.stompClient.connect(headers, () => {
      this.connectedPromise('success');
      this.connectedPromise = null;
    });
  }

  private createConnection(): Promise<any> {
    return new Promise((resolve, reject) => (this.connectedPromise = resolve));
  }

  private createListener(): Observable<any> {
    return new Observable(observer => {
      this.listenerObserver = observer;
    });
  }
}

import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpHeaders } from '@angular/common/http';
import { Observable, Observer, Subscription } from 'rxjs';

import { SERVER_API_URL } from 'app/app.constants';
import { createRequestOption } from 'app/shared/util/request-util';

import { Router } from '@angular/router';
import { WindowRef } from 'app/shared';

import { IQueue } from 'app/shared/model/queue.model';
import { Address, IAddress, IAddresses, IRootAddress } from 'app/shared/model/address.model';

import * as SockJS from 'sockjs-client';
import * as Stomp from 'webstomp-client';
import { CSRFService } from 'app/core';
import { BrokerService } from 'app/entities/broker';
import { IBroker } from 'app/shared/model/broker.model';

type EntityResponseType = HttpResponse<IQueue>;
type EntityArrayResponseType = HttpResponse<IQueue[]>;

type AddressesEntityResponseType = HttpResponse<IAddresses>;
type AddressEntityArrayResponseType = HttpResponse<IAddress[]>;

@Injectable({ providedIn: 'root' })
export class QueueService {
    public resourceUrl = SERVER_API_URL + 'api/queues';
    public queueManagerResourceUrl = SERVER_API_URL + 'api/brokers';
    public brokerResourceUrl = SERVER_API_URL + '';

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

    constructor(
        protected http: HttpClient,
        protected router: Router,
        protected $window: WindowRef,
        protected csrfService: CSRFService,
        protected brokerService: BrokerService
    ) {
        this.connection = this.createConnection();
        this.listener = this.createListener();
        // this.brokerType = 'classic';
    }

    create(queue: IQueue): Observable<EntityResponseType> {
        return this.http.post<IQueue>(this.resourceUrl, queue, { observe: 'response' });
    }

    update(queue: IQueue): Observable<EntityResponseType> {
        return this.http.put<IQueue>(this.resourceUrl, queue, { observe: 'response' });
    }

    find(id: number): Observable<EntityResponseType> {
        return this.http.get<IQueue>(`${this.resourceUrl}/${id}`, { observe: 'response' });
    }

    query(req?: any): Observable<EntityArrayResponseType> {
        const options = createRequestOption(req);
        return this.http.get<IQueue[]>(this.resourceUrl, { params: options, observe: 'response' });
    }

    delete(id: number): Observable<HttpResponse<{}>> {
        return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
    }

    getAllQueues(brokerType: string): Observable<HttpResponse<IRootAddress>> {
        return this.http.get<IRootAddress>(`${this.queueManagerResourceUrl}/${brokerType}/queues`, {
            headers: new HttpHeaders({ PlaceholderReplacement: 'true', Accept: 'application/json' }),
            observe: 'response'
        });
    }

    getBrokers(): Observable<HttpResponse<IBroker[]>> {
        return this.http.get<IBroker[]>(`${this.queueManagerResourceUrl}`, {
            headers: new HttpHeaders({ PlaceholderReplacement: 'true', Accept: 'application/json' }),
            observe: 'response'
        });
    }

    createQueue(name: string, brokerType: string): Observable<HttpResponse<string>> {
        return this.http.post(`${this.queueManagerResourceUrl}/${brokerType}/queue/${name}`, null, {
            observe: 'response',
            responseType: 'text'
        });
    }

    deleteQueue(name: string, brokerType: string): Observable<HttpResponse<string>> {
        return this.http.delete(`${this.queueManagerResourceUrl}/${brokerType}/queue/${name}`, {
            observe: 'response',
            responseType: 'text'
        });
    }

    clearQueue(name: string, brokerType: string): Observable<HttpResponse<string>> {
        return this.http.post(`${this.queueManagerResourceUrl}/${brokerType}/queue/${name}/clear`, null, {
            observe: 'response',
            responseType: 'text'
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
        headers['X-XSRF-TOKEN'] = this.csrfService.getCSRF('XSRF-TOKEN');

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
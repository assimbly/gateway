import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpHeaders } from '@angular/common/http';

import { Observable, Observer, Subscription } from 'rxjs';

import { SERVER_API_URL } from '../../app.constants';
import { Router, NavigationEnd } from '@angular/router';
import { WindowRef } from '../../shared/auth/window.service';
import { createRequestOption } from '../../shared';
import { saveAs } from 'file-saver/FileSaver';
import { IGateway, Gateway } from 'app/shared/model/gateway.model';
import { IFlow, Flow } from 'app/shared/model/flow.model';

import * as SockJS from 'sockjs-client';
import * as Stomp from 'webstomp-client';
import { tap } from "rxjs/operators";

type EntityResponseType = HttpResponse<IFlow>;
type EntityArrayResponseType = HttpResponse<IFlow[]>;

@Injectable({ providedIn: 'root' })
export class FlowService {
    
    stompClient = null;
    subscriber = null;
    connection: Promise<any>;
    connectedPromise: any;
    listener: Observable<any>;
    listenerObserver: Observer<any>;
    alreadyConnectedOnce = false;
    private subscription: Subscription;

    private resourceUrl = SERVER_API_URL + 'api/flows';
    private connectorUrl = SERVER_API_URL + 'api/connector';
    private environmentUrl = SERVER_API_URL + 'api/environment';

    private gatewayid = 1;

    constructor(
        private router: Router,
        private $window: WindowRef,
        protected http: HttpClient
        // tslint:disable-next-line: no-unused-variable
     ) {
        this.connection = this.createConnection();
        this.listener = this.createListener();
    }

    create(flow: IFlow): Observable<EntityResponseType> {
        return this.http.post<IFlow>(this.resourceUrl, flow, { observe: 'response' });
    }

    delete(id: number): Observable<HttpResponse<any>> {
        return this.http.delete<any>(`${this.resourceUrl}/${id}`, { observe: 'response' });
    }

    update(flow: IFlow): Observable<EntityResponseType> {
        return this.http.put<IFlow>(this.resourceUrl, flow, { observe: 'response' });
    }

    find(id: number): Observable<EntityResponseType> {
        return this.http.get<IFlow>(`${this.resourceUrl}/${id}`, { observe: 'response' });
    }

    query(req?: any): Observable<EntityArrayResponseType> {
        const options = createRequestOption(req);
        return this.http.get<IFlow[]>(this.resourceUrl, { params: options, observe: 'response' });
    }

    getFlowByGatewayId(gatewayid: Number): Observable<EntityResponseType> {
        return this.http.get(`${this.resourceUrl}/bygatewayid/${gatewayid}`, { observe: 'response' });
    }

    getConfiguration(flowid: number): Observable<any> {
        return this.http.get(`${this.environmentUrl}/${this.gatewayid}/flow/${flowid}`, { observe: 'response' });
    }

    setConfiguration(id: number, xmlconfiguration: string, header?: string): Observable<EntityResponseType> {
        if (!!header) {
            const options = {
                    headers: new HttpHeaders({'Accept': 'application/xml'})
            };
            return this.http.post<any>(`${this.connectorUrl}/${this.gatewayid}/setflowconfiguration/${id}`, xmlconfiguration, options);
        } else {
            return this.http.post<any>(`${this.connectorUrl}/${this.gatewayid}/setflowconfiguration/${id}`, xmlconfiguration);
        }
    }

    saveFlows(id: number, xmlconfiguration: string, header: string): Observable<EntityResponseType> {
        const options = {
                headers: new HttpHeaders({'Accept': 'application/xml'})
        };
        return this.http.post<any>(`${this.environmentUrl}/${this.gatewayid}/flow/${id}`, xmlconfiguration, options);
    }

    validateFlowsUri(connectorId: number, uri: string): Observable<EntityResponseType> {
        const options = {
                headers: new HttpHeaders({'Accept': 'application/xml'})
        };
        return this.http.get<any>(`${this.connectorUrl}/${connectorId}/flow/validateUri`, options);
    }

    start(id: number): Observable<any> {
        return this.http.get(`${this.connectorUrl}/${this.gatewayid}/flow/start/${id}`, { observe: 'response' });
    }

    pause(id: number): Observable<any> {
        return this.http.get(`${this.connectorUrl}/${this.gatewayid}/flow/pause/${id}`, { observe: 'response' });
    }

    resume(id: number): Observable<any> {
        return this.http.get(`${this.connectorUrl}/${this.gatewayid}/flow/resume/${id}`, { observe: 'response' });
    }

    restart(id: number): Observable<any> {
        return this.http.get(`${this.connectorUrl}/${this.gatewayid}/flow/restart/${id}`, { observe: 'response' });
    }

    stop(id: number): Observable<any> {
        return this.http.get(`${this.connectorUrl}/${this.gatewayid}/flow/stop/${id}`, { observe: 'response' });
    }

    getFlowStatus(id: number): Observable<any> {
        return this.http.get(`${this.connectorUrl}/${this.gatewayid}/flow/status/${id}`, { observe: 'response' });
    }

    getFlowAlerts(id: number): Observable<any> {
        return this.http.get(`${this.connectorUrl}/${this.gatewayid}/flow/alerts/${id}`, { observe: 'response' });
    }

    getFlowNumberOfAlerts(id: number): Observable<any> {
        return this.http.get(`${this.connectorUrl}/${this.gatewayid}/flow/numberofalerts/${id}`, { observe: 'response' });
    }

    getFlowLastError(id: number): Observable<any> {
        return this.http.get(`${this.connectorUrl}/${this.gatewayid}/flow/lasterror/${id}`, { observe: 'response' });
    }

    getFlowStats(id: number, gatewayid: number): Observable<any> {
        return this.http.get(`${this.connectorUrl}/${gatewayid}/flow/stats/${id}`, { observe: 'response' });
    }

    getComponentOptions(gatewayid: number, componentType: String): Observable<any> {
        return this.http.get(`${this.connectorUrl}/${gatewayid}/flow/schema/` + componentType, { observe: 'response' });
    }

    getWikiDocUrl() {
        return this.http.get(`${SERVER_API_URL}/api/wiki-url`, { observe: 'response' });
    }

    getCamelDocUrl() {
        return this.http.get(`${SERVER_API_URL}/api/camel-url`, { observe: 'response' });
    }

    setMaintenance(time: number, flowsIds: Array<number>): Observable<any> {
        return this.http.post(`${this.connectorUrl}/${this.gatewayid}/maintenance/${time}`, flowsIds, { observe: 'response' });
    }

    exportGatewayConfiguration(gateway: IGateway) {
        const url = `${this.environmentUrl}/${gateway.id}`;
                
        this.http.get(url, { headers: new HttpHeaders({
            'Accept': 'application/xml',
            'Content-Type': 'application/octet-stream',
            }), responseType: 'blob'}).pipe (
            tap (
              // Log the result or error
              data => {console.log('You received data')
                  const blob = new Blob([data], { type: 'application/xml' });
                  saveAs(blob, `${gateway.name}.xml`);              
              },
              error => console.log(error)
            )
           );
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
        // headers['X-XSRF-TOKEN'] = this.csrfService.getCSRF('XSRF-TOKEN');

        this.stompClient.connect(headers, () => {

            this.connectedPromise('success');
            this.connectedPromise = null;

        });
    }

    disconnect() {
        if (this.stompClient !== null) {
            this.stompClient.disconnect();
            this.stompClient = null;
        }
        if (this.subscription) {
            this.subscription.unsubscribe();
            this.subscription = null;
        }
        this.alreadyConnectedOnce = false;
    }

    receive() {
        return this.listener;
    }

    subscribe() {
        this.connection.then(() => {
            this.subscriber = this.stompClient.subscribe('/topic/alert', data => {
                this.listenerObserver.next(JSON.parse(data.body));
            });
        });
    }

    unsubscribe() {
        if (this.subscriber !== null) {
            this.subscriber.unsubscribe();
        }
        this.listener = this.createListener();
    }

    private createListener(): Observable<any> {
        return new Observable(observer => {
            this.listenerObserver = observer;
        });
    }

    private createConnection(): Promise<any> {
        return new Promise((resolve, reject) => (this.connectedPromise = resolve));
    }

    /**
     * Convert a returned JSON object to Flow.
     */
    private convertItemFromServer(json: any): IFlow {
        const entity: IFlow = Object.assign(new Flow(), json);
        return entity;
    }

}

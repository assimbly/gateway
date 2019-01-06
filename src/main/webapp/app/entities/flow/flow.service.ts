import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpHeaders } from '@angular/common/http';
import { Observable, Observer, Subscription } from 'rxjs';

import { SERVER_API_URL } from 'app/app.constants';
import { createRequestOption } from 'app/shared';

import { Router, NavigationEnd } from '@angular/router';
import { WindowRef } from '../../shared/auth/window.service';
import { saveAs } from 'file-saver/FileSaver';
import { IGateway, Gateway } from 'app/shared/model/gateway.model';
import { IFlow, Flow } from 'app/shared/model/flow.model';

import * as SockJS from 'sockjs-client';
import * as Stomp from 'webstomp-client';
import { tap } from "rxjs/operators";
import { CSRFService } from "app/core";

type EntityResponseType = HttpResponse<IFlow>;
type EntityArrayResponseType = HttpResponse<IFlow[]>;

@Injectable({ providedIn: 'root' })
export class FlowService {
    public resourceUrl = SERVER_API_URL + 'api/flows';
    public connectorUrl = SERVER_API_URL + 'api/connector';
    public environmentUrl = SERVER_API_URL + 'api/environment';
    
    stompClient = null;
    subscriber = null;
    connection: Promise<any>;
    connectedPromise: any;
    listener: Observable<any>;
    listenerObserver: Observer<any>;
    alreadyConnectedOnce = false;
    private subscription: Subscription;

    private gatewayid = 1;

    constructor(protected http: HttpClient,
		 protected router: Router,
         protected $window: WindowRef,
         protected csrfService: CSRFService 
     ) {
        this.connection = this.createConnection();
        this.listener = this.createListener();
    }

    create(flow: IFlow): Observable<EntityResponseType> {
        return this.http.post<IFlow>(this.resourceUrl, flow, { observe: 'response' });
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

    delete(id: number): Observable<HttpResponse<any>> {
        return this.http.delete<any>(`${this.resourceUrl}/${id}`, { observe: 'response' });
    }

    getFlowByGatewayId(gatewayid: Number): Observable<EntityResponseType> {
        return this.http.get(`${this.resourceUrl}/bygatewayid/${gatewayid}`, { observe: 'response' });
    }

    getConfiguration(flowid: number): Observable<HttpResponse<any>> {
        return this.http.get(`${this.environmentUrl}/${this.gatewayid}/flow/${flowid}`, { observe: 'response' });
    }

    setConfiguration(id: number, xmlconfiguration: string, header?: string): Observable<any> {
        if (!!header) {
            const options = {
                    headers: new HttpHeaders({observe: 'response', responseType: 'text','Accept': 'application/xml'})
            };
            return this.http.post(`${this.connectorUrl}/${this.gatewayid}/setflowconfiguration/${id}`, xmlconfiguration, options);
        } else {
            return this.http.post(`${this.connectorUrl}/${this.gatewayid}/setflowconfiguration/${id}`, xmlconfiguration, {observe: 'response', responseType: 'text' });
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

    start(id: number): Observable<HttpResponse<any>> {
        return this.http.get(`${this.connectorUrl}/${this.gatewayid}/flow/start/${id}`, {observe: 'response', responseType: 'text' });
    }

    pause(id: number): Observable<HttpResponse<any>> {
        return this.http.get(`${this.connectorUrl}/${this.gatewayid}/flow/pause/${id}`, {observe: 'response', responseType: 'text' });
    }

    resume(id: number): Observable<HttpResponse<any>> {
        return this.http.get(`${this.connectorUrl}/${this.gatewayid}/flow/resume/${id}`, {observe: 'response', responseType: 'text' });
    }

    restart(id: number): Observable<HttpResponse<any>> {
        return this.http.get(`${this.connectorUrl}/${this.gatewayid}/flow/restart/${id}`, {observe: 'response', responseType: 'text' });
    }

    stop(id: number): Observable<HttpResponse<any>> {
        return this.http.get(`${this.connectorUrl}/${this.gatewayid}/flow/stop/${id}`, {observe: 'response', responseType: 'text' });
    }

    getFlowStatus(id: number): Observable<any> {
        return this.http.get(`${this.connectorUrl}/${this.gatewayid}/flow/status/${id}`, { observe: 'response', responseType: 'text' });
    }

    getFlowAlerts(id: number): Observable<any> {
        return this.http.get(`${this.connectorUrl}/${this.gatewayid}/flow/alerts/${id}`, { observe: 'response', responseType: 'text' });
    }

    getFlowNumberOfAlerts(id: number): Observable<any> {
        return this.http.get(`${this.connectorUrl}/${this.gatewayid}/flow/numberofalerts/${id}`, { observe: 'response', responseType: 'text' });
    }

    getFlowLastError(id: number): Observable<any> {
        return this.http.get(`${this.connectorUrl}/${this.gatewayid}/flow/lasterror/${id}`, { observe: 'response', responseType: 'text' });
    }

    getFlowStats(id: number, gatewayid: number): Observable<HttpResponse<any>> {
        return this.http.get(`${this.connectorUrl}/${gatewayid}/flow/stats/${id}`, { observe: 'response' });
    }

    getComponentOptions(gatewayid: number, componentType: String): Observable<any> {
        return this.http.get(`${this.connectorUrl}/${gatewayid}/flow/schema/` + componentType, { observe: 'response' });
    }

    getWikiDocUrl(): Observable<HttpResponse<any>> {
        return this.http.get(`${SERVER_API_URL}/api/wiki-url`, { observe: 'response',responseType: 'text' });
    }

    getCamelDocUrl(): Observable<HttpResponse<any>> {
        return this.http.get(`${SERVER_API_URL}/api/camel-url`, { observe: 'response',responseType: 'text' });
    }

    setMaintenance(time: number, flowsIds: Array<number>): Observable<HttpResponse<any>> {
        return this.http.post(`${this.connectorUrl}/${this.gatewayid}/maintenance/${time}`, flowsIds, { observe: 'response', responseType: 'text' });
    }

    exportGatewayConfiguration(gateway: IGateway) {
        const url = `${this.environmentUrl}/${gateway.id}`;
        this.http.get(url, { headers: new HttpHeaders({
            'Accept': 'application/xml',
            'Content-Type': 'application/octet-stream',
            }), observe: 'response', responseType: 'blob'}).subscribe(data => {
                  const blob = new Blob([data.body], { type: 'application/xml' });
                  saveAs(blob, `${gateway.name}.xml`);              
              },
              error => console.log(error)
            )
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

    connectionStomp(){
        return this.connection;
     }
    
    client(){
       return this.stompClient;
    }

    subscribe(id) {
        const topic = '/topic/' + id + '/alert';
        
        this.connection.then(() => {
            this.subscriber = this.stompClient.subscribe(topic, data => {
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

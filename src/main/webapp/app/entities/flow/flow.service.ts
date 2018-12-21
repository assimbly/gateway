import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions, ResponseContentType } from '@angular/http';
import { Observable, Observer, Subscription } from 'rxjs';
import { SERVER_API_URL } from '../../app.constants';
import { Router, NavigationEnd } from '@angular/router';
import { CSRFService } from '../../shared/auth/csrf.service';
import { WindowRef } from '../../shared/auth/window.service';
import { Flow } from './flow.model';
import { ResponseWrapper, createRequestOption } from '../../shared';
import { saveAs } from 'file-saver/FileSaver';
import { Gateway } from '../gateway/gateway.model';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';

import * as SockJS from 'sockjs-client';
import * as Stomp from 'webstomp-client';

@Injectable()
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
    private environmentUrl = SERVER_API_URL + 'api/environment'

    private gatewayid = 1;

    constructor(
        private http: Http,
        private router: Router,
        private $window: WindowRef,
        // tslint:disable-next-line: no-unused-variable
        private csrfService: CSRFService) {
        this.connection = this.createConnection();
        this.listener = this.createListener();
    }

    create(flow: Flow): Observable<Flow> {
        const copy = this.convert(flow);
        return this.http.post(this.resourceUrl, copy).map((res: Response) => {
            const jsonResponse = res.json();
            return this.convertItemFromServer(jsonResponse);
        });
    }

    update(flow: Flow): Observable<Flow> {
        const copy = this.convert(flow);
        return this.http.put(this.resourceUrl, copy).map((res: Response) => {
            const jsonResponse = res.json();
            return this.convertItemFromServer(jsonResponse);
        });
    }

    find(id: number): Observable<Flow> {
        return this.http.get(`${this.resourceUrl}/${id}`).map((res: Response) => {
            const jsonResponse = res.json();
            return this.convertItemFromServer(jsonResponse);
        });
    }

    query(req?: any): Observable<ResponseWrapper> {
        const options = createRequestOption(req);
        return this.http.get(this.resourceUrl, options)
            .map((res: Response) => this.convertResponse(res));
    }

    getFlowByGatewayId(gatewayid: Number): Observable<ResponseWrapper> {
        return this.http.get(`${this.resourceUrl}/bygatewayid/${gatewayid}`)
            .map((res: Response) => this.convertResponse(res));
    }

    delete(id: number): Observable<Response> {
        return this.http.delete(`${this.resourceUrl}/${id}`);
    }

    getConfiguration(flowid: number): Observable<Response> {
        return this.http.get(`${this.environmentUrl}/${this.gatewayid}/flow/${flowid}`);
    }

    setConfiguration(id: number, xmlconfiguration: string, header?: string): Observable<Response> {
        if (!!header) {
            let headers = new Headers();
            headers.append('Accept', header);
            let options = new RequestOptions();
            options.headers = headers;
            return this.http.post(`${this.connectorUrl}/${this.gatewayid}/setflowconfiguration/${id}`, xmlconfiguration, options);
        } else {
            return this.http.post(`${this.connectorUrl}/${this.gatewayid}/setflowconfiguration/${id}`, xmlconfiguration);
        }
    }
    saveFlows(id: number, xmlconfiguration: string, header: string): Observable<Response> {
        let headers = new Headers();
        headers.append('Accept', header);
        let options = new RequestOptions();
        options.headers = headers;
        return this.http.post(`${this.environmentUrl}/${this.gatewayid}/flow/${id}`, xmlconfiguration, options);
    }

    validateFlowsUri(connectorId: number, uri: string): Observable<Response> {
        let headers = new Headers();
        headers.append('Uri', uri);
        let options = new RequestOptions();
        options.headers = headers;
        return this.http.get(`${this.connectorUrl}/${connectorId}/flow/validateUri`, options);
    }

    start(id: number): Observable<Response> {
        return this.http.get(`${this.connectorUrl}/${this.gatewayid}/flow/start/${id}`);
    }

    pause(id: number): Observable<Response> {
        return this.http.get(`${this.connectorUrl}/${this.gatewayid}/flow/pause/${id}`);
    }

    resume(id: number): Observable<Response> {
        return this.http.get(`${this.connectorUrl}/${this.gatewayid}/flow/resume/${id}`);
    }

    restart(id: number): Observable<Response> {
        return this.http.get(`${this.connectorUrl}/${this.gatewayid}/flow/restart/${id}`);
    }

    stop(id: number): Observable<Response> {
        return this.http.get(`${this.connectorUrl}/${this.gatewayid}/flow/stop/${id}`);
    }

    getFlowStatus(id: number): Observable<Response> {
        return this.http.get(`${this.connectorUrl}/${this.gatewayid}/flow/status/${id}`);
    }

    getFlowAlerts(id: number): Observable<Response> {
        return this.http.get(`${this.connectorUrl}/${this.gatewayid}/flow/alerts/${id}`);
    }

    getFlowNumberOfAlerts(id: number): Observable<Response> {
        return this.http.get(`${this.connectorUrl}/${this.gatewayid}/flow/numberofalerts/${id}`);
    }

    getFlowLastError(id: number): Observable<Response> {
        return this.http.get(`${this.connectorUrl}/${this.gatewayid}/flow/lasterror/${id}`);
    }

    getFlowStats(id: number, gatewayid: number): Observable<Response> {
        return this.http.get(`${this.connectorUrl}/${gatewayid}/flow/stats/${id}`);
    }

    getComponentOptions(gatewayid: number, componentType: String): Observable<Response> {
        return this.http.get(`${this.connectorUrl}/${gatewayid}/flow/schema/` + componentType);
    }

    getWikiDocUrl() {
        return this.http.get(`${SERVER_API_URL}/api/wiki-url`);
    }

    getCamelDocUrl() {
        return this.http.get(`${SERVER_API_URL}/api/camel-url`)
    }

    setMaintenance(time: number, flowsIds: Array<number>): Observable<Response> {
        return this.http.post(`${this.connectorUrl}/${this.gatewayid}/maintenance/${time}`, flowsIds);
    }

    exportGatewayConfiguration(gateway: Gateway) {
        const url = `${this.environmentUrl}/${gateway.id}`;
        let headers = new Headers();
        headers.append('Accept', 'application/xml');
        const options = new RequestOptions({ responseType: ResponseContentType.Blob });
        options.headers = headers
        this.http.get(url, options).subscribe((res) => {
            const b = res.blob();
            const blob = new Blob([b], { type: 'application/xml' });
            saveAs(blob, `${gateway.name}.xml`);
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
            this.subscriber = this.stompClient.subscribe('/topic/alert', (data) => {
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
        return new Observable((observer) => {
            this.listenerObserver = observer;
        }).share();
    }

    private createConnection(): Promise<any> {
        return new Promise((resolve, reject) => (this.connectedPromise = resolve));
    }

    private convertResponse(res: Response): ResponseWrapper {
        const jsonResponse = res.json();
        const result = [];
        for (let i = 0; i < jsonResponse.length; i++) {
            result.push(this.convertItemFromServer(jsonResponse[i]));
        }
        return new ResponseWrapper(res.headers, result, res.status);
    }

    /**
     * Convert a returned JSON object to Flow.
     */
    private convertItemFromServer(json: any): Flow {
        const entity: Flow = Object.assign(new Flow(), json);
        return entity;
    }

    /**
     * Convert a Flow to a JSON which can be sent to the server.
     */
    private convert(flow: Flow): Flow {
        const copy: Flow = Object.assign({}, flow);
        return copy;
    }
}

import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions, ResponseContentType } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { SERVER_API_URL } from '../../app.constants';

import { Flow } from './flow.model';
import { ResponseWrapper, createRequestOption } from '../../shared';
import { saveAs } from 'file-saver/FileSaver';
import { Gateway } from '../gateway/gateway.model';

@Injectable()
export class FlowService {

    private resourceUrl = SERVER_API_URL + 'api/flows';
    private connectorUrl = SERVER_API_URL + 'api/connector';
    private environmentUrl  = SERVER_API_URL + 'api/environment'

    private gatewayid = 1;

    constructor(private http: Http) { }

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

    getConfiguration(flowid: number): Observable<Response>  {
        return this.http.get(`${this.environmentUrl}/${this.gatewayid}/flow/${flowid}`);
    }

    setConfiguration(id: number, xmlconfiguration: string, header?: string): Observable<Response> {
        if (!!header) {
            let headers = new Headers();
            headers.append('Accept', header);
            let options = new RequestOptions();
            options.headers = headers;
            return this.http.post(`${this.connectorUrl}/${this.gatewayid}/setflowconfiguration/${id}`, xmlconfiguration, options);
        }else {
            return this.http.post(`${this.connectorUrl}/${this.gatewayid}/setflowconfiguration/${id}`, xmlconfiguration);
        }
    }

    validateFlowsUri(connectorId: number, uri: string): Observable<Response> {
        let headers = new Headers();
        headers.append('Uri', uri);
        let options = new RequestOptions();
        options.headers = headers;
        return this.http.get(`${this.connectorUrl}/${connectorId}/flow/validateUri`, options);
    }

    start(id: number): Observable<Response> {
        console.log(`${this.connectorUrl}/${this.gatewayid}/flow/start/${id}`);
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
    getFlowLastError(id: number): Observable<Response> {
        return this.http.get(`${this.connectorUrl}/${this.gatewayid}/flow/lasterror/${id}`);
    }

    getFlowStats(id: number, gatewayid: number): Observable<Response> {
        return this.http.get(`${this.connectorUrl}/${gatewayid}/flow/stats/${id}`);
    }

    getWikiDocUrl() {
        return this.http.get(`${SERVER_API_URL}/api/wiki-url`);
    }

    getCamelDocUrl() {
        return this.http.get(`${SERVER_API_URL}/api/camel-url`)
    }

    setMaintainance(time: number, flowsIds: Array<number>): Observable<Response> {
        return this.http.post(`${this.connectorUrl}/${this.gatewayid}/maintainance/${time}`, flowsIds);
    }

    exportGatewayConfiguration(gateway: Gateway) {
        const url = `${this.environmentUrl}/${gateway.id}`;
        let headers = new Headers();
        headers.append('Accept', 'application/xml');
        const options = new RequestOptions({responseType: ResponseContentType.Blob });
        options.headers = headers
        this.http.get(url, options).subscribe((res) => {
            const b = res.blob();
            const blob = new Blob([b], { type: 'application/xml' });
            saveAs(blob, `${gateway.name}.xml`);
        });
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

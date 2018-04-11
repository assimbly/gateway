import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { SERVER_API_URL } from '../../app.constants';

import { Flow } from './flow.model';
import { ResponseWrapper, createRequestOption } from '../../shared';

@Injectable()
export class FlowService {

    private resourceUrl = SERVER_API_URL + 'api/flows';
    private connectorUrl = SERVER_API_URL + 'api/connector';
    private configurationUrl = SERVER_API_URL + 'api/configuration';

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

    delete(id: number): Observable<Response> {
        return this.http.delete(`${this.resourceUrl}/${id}`);
    }

    getConfiguration(id: number): Observable<Response>  {
        const gatewayid = 1;
        return this.http.get(`${this.configurationUrl}/${gatewayid}/getflowconfiguration/${id}`);
    }

    setConfiguration(id: number, xmlconfiguration: string): Observable<Response> {
        const gatewayid = 1;
        return this.http.post(`${this.connectorUrl}/${gatewayid}/setflowconfiguration/${id}`, xmlconfiguration);
    }

    start(id: number): Observable<Response> {
        const gatewayid = 1;
        return this.http.get(`${this.connectorUrl}/${gatewayid}/flow/start/${id}`);
    }

    restart(id: number): Observable<Response> {
        const gatewayid = 1;
        return this.http.get(`${this.connectorUrl}/${gatewayid}/flow/restart/${id}`);
    }

    stop(id: number): Observable<Response> {
        const gatewayid = 1;
        return this.http.get(`${this.connectorUrl}/${gatewayid}/flow/stop/${id}`);
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

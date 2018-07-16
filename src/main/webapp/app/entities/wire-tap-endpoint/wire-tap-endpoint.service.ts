import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { SERVER_API_URL } from '../../app.constants';

import { WireTapEndpoint } from './wire-tap-endpoint.model';
import { ResponseWrapper, createRequestOption } from '../../shared';

@Injectable()
export class WireTapEndpointService {

    private resourceUrl =  SERVER_API_URL + 'api/wire-tap-endpoints';

    constructor(private http: Http) { }

    create(wireTapEndpoint: WireTapEndpoint): Observable<WireTapEndpoint> {
        const copy = this.convert(wireTapEndpoint);
        return this.http.post(this.resourceUrl, copy).map((res: Response) => {
            const jsonResponse = res.json();
            return this.convertItemFromServer(jsonResponse);
        });
    }

    update(wireTapEndpoint: WireTapEndpoint): Observable<WireTapEndpoint> {
        const copy = this.convert(wireTapEndpoint);
        return this.http.put(this.resourceUrl, copy).map((res: Response) => {
            const jsonResponse = res.json();
            return this.convertItemFromServer(jsonResponse);
        });
    }

    find(id: number): Observable<WireTapEndpoint> {
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

    private convertResponse(res: Response): ResponseWrapper {
        const jsonResponse = res.json();
        const result = [];
        for (let i = 0; i < jsonResponse.length; i++) {
            result.push(this.convertItemFromServer(jsonResponse[i]));
        }
        return new ResponseWrapper(res.headers, result, res.status);
    }

    /**
     * Convert a returned JSON object to WireTapEndpoint.
     */
    private convertItemFromServer(json: any): WireTapEndpoint {
        const entity: WireTapEndpoint = Object.assign(new WireTapEndpoint(), json);
        return entity;
    }

    /**
     * Convert a WireTapEndpoint to a JSON which can be sent to the server.
     */
    private convert(wireTapEndpoint: WireTapEndpoint): WireTapEndpoint {
        const copy: WireTapEndpoint = Object.assign({}, wireTapEndpoint);
        return copy;
    }
}

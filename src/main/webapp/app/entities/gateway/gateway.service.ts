import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { SERVER_API_URL } from '../../app.constants';

import { Gateway } from './gateway.model';
import { ResponseWrapper, createRequestOption } from '../../shared';

@Injectable()
export class GatewayService {

    private resourceUrl =  SERVER_API_URL + 'api/gateways';

    constructor(private http: Http) { }

    create(gateway: Gateway): Observable<Gateway> {
        const copy = this.convert(gateway);
        return this.http.post(this.resourceUrl, copy).map((res: Response) => {
            const jsonResponse = res.json();
            return this.convertItemFromServer(jsonResponse);
        });
    }

    update(gateway: Gateway): Observable<Gateway> {
        const copy = this.convert(gateway);
        return this.http.put(this.resourceUrl, copy).map((res: Response) => {
            const jsonResponse = res.json();
            return this.convertItemFromServer(jsonResponse);
        });
    }

    find(id: number): Observable<Gateway> {
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
     * Convert a returned JSON object to Gateway.
     */
    private convertItemFromServer(json: any): Gateway {
        const entity: Gateway = Object.assign(new Gateway(), json);
        return entity;
    }

    /**
     * Convert a Gateway to a JSON which can be sent to the server.
     */
    private convert(gateway: Gateway): Gateway {
        const copy: Gateway = Object.assign({}, gateway);
        return copy;
    }
}

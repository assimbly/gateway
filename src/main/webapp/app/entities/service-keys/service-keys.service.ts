import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { SERVER_API_URL } from '../../app.constants';

import { ServiceKeys } from './service-keys.model';
import { ResponseWrapper, createRequestOption } from '../../shared';

@Injectable()
export class ServiceKeysService {

    private resourceUrl =  SERVER_API_URL + 'api/service-keys';

    constructor(private http: Http) { }

    create(serviceKeys: ServiceKeys): Observable<ServiceKeys> {
        const copy = this.convert(serviceKeys);
        return this.http.post(this.resourceUrl, copy).map((res: Response) => {
            const jsonResponse = res.json();
            return this.convertItemFromServer(jsonResponse);
        });
    }

    update(serviceKeys: ServiceKeys): Observable<ServiceKeys> {
        const copy = this.convert(serviceKeys);
        return this.http.put(this.resourceUrl, copy).map((res: Response) => {
            const jsonResponse = res.json();
            return this.convertItemFromServer(jsonResponse);
        });
    }

    find(id: number): Observable<ServiceKeys> {
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
     * Convert a returned JSON object to ServiceKeys.
     */
    private convertItemFromServer(json: any): ServiceKeys {
        const entity: ServiceKeys = Object.assign(new ServiceKeys(), json);
        return entity;
    }

    /**
     * Convert a ServiceKeys to a JSON which can be sent to the server.
     */
    private convert(serviceKeys: ServiceKeys): ServiceKeys {
        const copy: ServiceKeys = Object.assign({}, serviceKeys);
        return copy;
    }
}

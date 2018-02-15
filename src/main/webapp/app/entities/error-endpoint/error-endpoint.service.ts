import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { SERVER_API_URL } from '../../app.constants';

import { ErrorEndpoint } from './error-endpoint.model';
import { ResponseWrapper, createRequestOption } from '../../shared';

@Injectable()
export class ErrorEndpointService {

    private resourceUrl =  SERVER_API_URL + 'api/error-endpoints';

    constructor(private http: Http) { }

    create(errorEndpoint: ErrorEndpoint): Observable<ErrorEndpoint> {
        const copy = this.convert(errorEndpoint);
        return this.http.post(this.resourceUrl, copy).map((res: Response) => {
            const jsonResponse = res.json();
            return this.convertItemFromServer(jsonResponse);
        });
    }

    update(errorEndpoint: ErrorEndpoint): Observable<ErrorEndpoint> {
        const copy = this.convert(errorEndpoint);
        return this.http.put(this.resourceUrl, copy).map((res: Response) => {
            const jsonResponse = res.json();
            return this.convertItemFromServer(jsonResponse);
        });
    }

    find(id: number): Observable<ErrorEndpoint> {
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
     * Convert a returned JSON object to ErrorEndpoint.
     */
    private convertItemFromServer(json: any): ErrorEndpoint {
        const entity: ErrorEndpoint = Object.assign(new ErrorEndpoint(), json);
        return entity;
    }

    /**
     * Convert a ErrorEndpoint to a JSON which can be sent to the server.
     */
    private convert(errorEndpoint: ErrorEndpoint): ErrorEndpoint {
        const copy: ErrorEndpoint = Object.assign({}, errorEndpoint);
        return copy;
    }
}

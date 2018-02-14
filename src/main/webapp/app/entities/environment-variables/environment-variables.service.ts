import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { SERVER_API_URL } from '../../app.constants';

import { EnvironmentVariables } from './environment-variables.model';
import { ResponseWrapper, createRequestOption } from '../../shared';

@Injectable()
export class EnvironmentVariablesService {

    private resourceUrl =  SERVER_API_URL + 'api/environment-variables';

    constructor(private http: Http) { }

    create(environmentVariables: EnvironmentVariables): Observable<EnvironmentVariables> {
        const copy = this.convert(environmentVariables);
        return this.http.post(this.resourceUrl, copy).map((res: Response) => {
            const jsonResponse = res.json();
            return this.convertItemFromServer(jsonResponse);
        });
    }

    update(environmentVariables: EnvironmentVariables): Observable<EnvironmentVariables> {
        const copy = this.convert(environmentVariables);
        return this.http.put(this.resourceUrl, copy).map((res: Response) => {
            const jsonResponse = res.json();
            return this.convertItemFromServer(jsonResponse);
        });
    }

    find(id: number): Observable<EnvironmentVariables> {
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
     * Convert a returned JSON object to EnvironmentVariables.
     */
    private convertItemFromServer(json: any): EnvironmentVariables {
        const entity: EnvironmentVariables = Object.assign(new EnvironmentVariables(), json);
        return entity;
    }

    /**
     * Convert a EnvironmentVariables to a JSON which can be sent to the server.
     */
    private convert(environmentVariables: EnvironmentVariables): EnvironmentVariables {
        const copy: EnvironmentVariables = Object.assign({}, environmentVariables);
        return copy;
    }
}

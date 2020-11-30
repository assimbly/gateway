import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { SERVER_API_URL } from 'app/app.constants';
import { createRequestOption } from 'app/shared';
import { IEndpoint, Endpoint } from 'app/shared/model/endpoint.model';
import { map } from 'rxjs/operators';

type EntityResponseType = HttpResponse<IEndpoint>;
type EntityArrayResponseType = HttpResponse<IEndpoint[]>;

@Injectable({ providedIn: 'root' })
export class EndpointService {
    private resourceUrlEndpoint = SERVER_API_URL + 'api/endpoint';
    private resourceUrlEndpoints = SERVER_API_URL + 'api/endpoints';
    public resourceUrl = SERVER_API_URL + 'api/endpoints';

    constructor(protected http: HttpClient) {}

    create(endpoint: IEndpoint): Observable<HttpResponse<IEndpoint>> {
        const copy = this.convert(endpoint);
        return this.http.post(this.resourceUrlEndpoint, copy, { observe: 'response' });
    }

    createMultiple(endpoints: Array<IEndpoint>): Observable<HttpResponse<any>> {
        const copy = new Array<IEndpoint>();
        endpoints.forEach(endpoint => {
            copy.push(this.convert(endpoint));
        });
        return this.http.post(this.resourceUrlEndpoints, copy, { observe: 'response' });
    }

    updateMultiple(endpoints: Array<IEndpoint>): Observable<HttpResponse<any>> {
        const copy = new Array<IEndpoint>();
        endpoints.forEach(endpoint => {
            copy.push(this.convert(endpoint));
        });
        return this.http.put(this.resourceUrlEndpoints, copy, { observe: 'response' });
    }

    update(endpoint: IEndpoint): Observable<EntityResponseType> {
        return this.http.put<IEndpoint>(this.resourceUrl, endpoint, { observe: 'response' });
    }

    find(id: number): Observable<EntityResponseType> {
        return this.http.get<IEndpoint>(`${this.resourceUrlEndpoint}/${id}`, { observe: 'response' });
    }

    findByFlowId(id: number): Observable<HttpResponse<any>> {
        return this.http.get(`${this.resourceUrlEndpoints}/byflowid/${id}`, { observe: 'response' });
    }

    query(req?: any): Observable<EntityArrayResponseType> {
        const options = createRequestOption(req);
        return this.http.get<IEndpoint[]>(this.resourceUrl, { params: options, observe: 'response' });
    }

    delete(id: number): Observable<HttpResponse<any>> {
        return this.http.delete<any>(`${this.resourceUrl}/${id}`, { observe: 'response' });
    }

    /**
     * Convert a returned JSON object endpoint.
     */
    private convertItemFromServer(json: any): IEndpoint {
        const entity: IEndpoint = Object.assign(new Endpoint(), json);
        return entity;
    }

    /**
     * Convert a returned JSON object to Array<Endpoint>.
     */
    private convertItemsFromServer(json: any): Array<IEndpoint> {
        const entities: Array<IEndpoint> = new Array<IEndpoint>();
        json.forEach(element => {
            entities.push(Object.assign(new Endpoint(), element));
        });
        return entities;
    }

    /**
     * Convert a Endpoint to a JSON which can be sent to the server.
     */
    private convert(endpoint: IEndpoint): IEndpoint {
        const copy: IEndpoint = Object.assign({}, endpoint);
        return copy;
    }
}

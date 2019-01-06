import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { SERVER_API_URL } from 'app/app.constants';
import { createRequestOption } from 'app/shared';
import { IToEndpoint, ToEndpoint } from 'app/shared/model/to-endpoint.model';
import { map } from "rxjs/operators";

type EntityResponseType = HttpResponse<IToEndpoint>;
type EntityArrayResponseType = HttpResponse<IToEndpoint[]>;

@Injectable({ providedIn: 'root' })
export class ToEndpointService {

    private resourceUrlToEndpoint =  SERVER_API_URL + 'api/to-endpoint';
    private resourceUrlToEndpoints =  SERVER_API_URL + 'api/to-endpoints';
    public resourceUrl = SERVER_API_URL + 'api/to-endpoints';

    constructor(protected http: HttpClient) {}

    create(toEndpoint: IToEndpoint): Observable<HttpResponse<IToEndpoint>> {
        const copy = this.convert(toEndpoint);
        return this.http.post(this.resourceUrlToEndpoint, copy, { observe: 'response' });
    }

    createMultiple(toEndpoints: Array<IToEndpoint>): Observable<HttpResponse<any>> {
        const copy = new Array<IToEndpoint>();
        toEndpoints.forEach((toEndpoint) => {
            copy.push(this.convert(toEndpoint))
        });
        return this.http.post(this.resourceUrlToEndpoints, copy, { observe: 'response' });
    }

    updateMultiple(toEndpoints: Array<IToEndpoint>): Observable<HttpResponse<any>> {
        const copy = new Array<IToEndpoint>();
        toEndpoints.forEach((toEndpoint) => {
            copy.push(this.convert(toEndpoint))
        });
        return this.http.put(this.resourceUrlToEndpoints, copy, { observe: 'response' });
    }

    update(toEndpoint: IToEndpoint): Observable<EntityResponseType> {
        return this.http.put<IToEndpoint>(this.resourceUrl, toEndpoint, { observe: 'response' });
    }

    find(id: number): Observable<EntityResponseType> {
        return this.http.get<IToEndpoint>(`${this.resourceUrl}/${id}`, { observe: 'response' });
    }

    findByFlowId(id: number): Observable<HttpResponse<any>> {
        return this.http.get(`${this.resourceUrlToEndpoints}/byflowid/${id}`, { observe: 'response' });
    }

    query(req?: any): Observable<EntityArrayResponseType> {
        const options = createRequestOption(req);
        return this.http.get<IToEndpoint[]>(this.resourceUrl, { params: options, observe: 'response' });
    }

    delete(id: number): Observable<HttpResponse<any>> {
        return this.http.delete<any>(`${this.resourceUrl}/${id}`, { observe: 'response' });
    }
    

    /**
     * Convert a returned JSON object to ToEndpoint.
     */
    private convertItemFromServer(json: any): IToEndpoint {
        const entity: IToEndpoint = Object.assign(new ToEndpoint(), json);
        return entity;
    }

    /**
     * Convert a returned JSON object to Array<ToEndpoint>.
     */
    private convertItemsFromServer(json: any): Array<IToEndpoint> {
        const entities: Array<IToEndpoint> = new Array<IToEndpoint>();
        json.forEach((element) => {
            entities.push(Object.assign(new ToEndpoint(), element));
        });
        return entities;
    }

    /**
     * Convert a ToEndpoint to a JSON which can be sent to the server.
     */
    private convert(toEndpoint: IToEndpoint): IToEndpoint {
        const copy: IToEndpoint = Object.assign({}, toEndpoint);
        return copy;
    }
}

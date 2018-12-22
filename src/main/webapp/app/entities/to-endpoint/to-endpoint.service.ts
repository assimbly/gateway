import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { SERVER_API_URL } from 'app/app.constants';
import { createRequestOption } from 'app/shared';
import { IToEndpoint } from 'app/shared/model/to-endpoint.model';

type EntityResponseType = HttpResponse<IToEndpoint>;
type EntityArrayResponseType = HttpResponse<IToEndpoint[]>;

@Injectable({ providedIn: 'root' })
export class ToEndpointService {
    public resourceUrl = SERVER_API_URL + 'api/to-endpoints';

    constructor(protected http: HttpClient) {}

    create(toEndpoint: IToEndpoint): Observable<EntityResponseType> {
        return this.http.post<IToEndpoint>(this.resourceUrl, toEndpoint, { observe: 'response' });
    }

    update(toEndpoint: IToEndpoint): Observable<EntityResponseType> {
        return this.http.put<IToEndpoint>(this.resourceUrl, toEndpoint, { observe: 'response' });
    }

    find(id: number): Observable<EntityResponseType> {
        return this.http.get<IToEndpoint>(`${this.resourceUrl}/${id}`, { observe: 'response' });
    }

    query(req?: any): Observable<EntityArrayResponseType> {
        const options = createRequestOption(req);
        return this.http.get<IToEndpoint[]>(this.resourceUrl, { params: options, observe: 'response' });
    }

    delete(id: number): Observable<HttpResponse<any>> {
        return this.http.delete<any>(`${this.resourceUrl}/${id}`, { observe: 'response' });
    }
}

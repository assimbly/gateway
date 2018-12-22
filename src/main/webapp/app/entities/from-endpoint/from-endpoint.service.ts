import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { SERVER_API_URL } from 'app/app.constants';
import { createRequestOption } from 'app/shared';
import { IFromEndpoint } from 'app/shared/model/from-endpoint.model';

type EntityResponseType = HttpResponse<IFromEndpoint>;
type EntityArrayResponseType = HttpResponse<IFromEndpoint[]>;

@Injectable({ providedIn: 'root' })
export class FromEndpointService {
    public resourceUrl = SERVER_API_URL + 'api/from-endpoints';

    constructor(protected http: HttpClient) {}

    create(fromEndpoint: IFromEndpoint): Observable<EntityResponseType> {
        return this.http.post<IFromEndpoint>(this.resourceUrl, fromEndpoint, { observe: 'response' });
    }

    update(fromEndpoint: IFromEndpoint): Observable<EntityResponseType> {
        return this.http.put<IFromEndpoint>(this.resourceUrl, fromEndpoint, { observe: 'response' });
    }

    find(id: number): Observable<EntityResponseType> {
        return this.http.get<IFromEndpoint>(`${this.resourceUrl}/${id}`, { observe: 'response' });
    }

    query(req?: any): Observable<EntityArrayResponseType> {
        const options = createRequestOption(req);
        return this.http.get<IFromEndpoint[]>(this.resourceUrl, { params: options, observe: 'response' });
    }

    delete(id: number): Observable<HttpResponse<any>> {
        return this.http.delete<any>(`${this.resourceUrl}/${id}`, { observe: 'response' });
    }
}

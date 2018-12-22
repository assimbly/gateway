import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { SERVER_API_URL } from 'app/app.constants';
import { createRequestOption } from 'app/shared';
import { IErrorEndpoint } from 'app/shared/model/error-endpoint.model';

type EntityResponseType = HttpResponse<IErrorEndpoint>;
type EntityArrayResponseType = HttpResponse<IErrorEndpoint[]>;

@Injectable({ providedIn: 'root' })
export class ErrorEndpointService {
    public resourceUrl = SERVER_API_URL + 'api/error-endpoints';

    constructor(protected http: HttpClient) {}

    create(errorEndpoint: IErrorEndpoint): Observable<EntityResponseType> {
        return this.http.post<IErrorEndpoint>(this.resourceUrl, errorEndpoint, { observe: 'response' });
    }

    update(errorEndpoint: IErrorEndpoint): Observable<EntityResponseType> {
        return this.http.put<IErrorEndpoint>(this.resourceUrl, errorEndpoint, { observe: 'response' });
    }

    find(id: number): Observable<EntityResponseType> {
        return this.http.get<IErrorEndpoint>(`${this.resourceUrl}/${id}`, { observe: 'response' });
    }

    query(req?: any): Observable<EntityArrayResponseType> {
        const options = createRequestOption(req);
        return this.http.get<IErrorEndpoint[]>(this.resourceUrl, { params: options, observe: 'response' });
    }

    delete(id: number): Observable<HttpResponse<any>> {
        return this.http.delete<any>(`${this.resourceUrl}/${id}`, { observe: 'response' });
    }
}

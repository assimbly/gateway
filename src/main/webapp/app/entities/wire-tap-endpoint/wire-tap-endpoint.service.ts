import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { SERVER_API_URL } from 'app/app.constants';
import { createRequestOption } from 'app/shared';
import { IWireTapEndpoint } from 'app/shared/model/wire-tap-endpoint.model';

type EntityResponseType = HttpResponse<IWireTapEndpoint>;
type EntityArrayResponseType = HttpResponse<IWireTapEndpoint[]>;

@Injectable({ providedIn: 'root' })
export class WireTapEndpointService {
    public resourceUrl = SERVER_API_URL + 'api/wire-tap-endpoints';

    constructor(protected http: HttpClient) {}

    create(wireTapEndpoint: IWireTapEndpoint): Observable<EntityResponseType> {
        return this.http.post<IWireTapEndpoint>(this.resourceUrl, wireTapEndpoint, { observe: 'response' });
    }

    update(wireTapEndpoint: IWireTapEndpoint): Observable<EntityResponseType> {
        return this.http.put<IWireTapEndpoint>(this.resourceUrl, wireTapEndpoint, { observe: 'response' });
    }

    find(id: number): Observable<EntityResponseType> {
        return this.http.get<IWireTapEndpoint>(`${this.resourceUrl}/${id}`, { observe: 'response' });
    }

    query(req?: any): Observable<EntityArrayResponseType> {
        const options = createRequestOption(req);
        return this.http.get<IWireTapEndpoint[]>(this.resourceUrl, { params: options, observe: 'response' });
    }

    delete(id: number): Observable<HttpResponse<any>> {
        return this.http.delete<any>(`${this.resourceUrl}/${id}`, { observe: 'response' });
    }
}

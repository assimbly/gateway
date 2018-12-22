import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { SERVER_API_URL } from 'app/app.constants';
import { createRequestOption } from 'app/shared';
import { IGateway } from 'app/shared/model/gateway.model';

type EntityResponseType = HttpResponse<IGateway>;
type EntityArrayResponseType = HttpResponse<IGateway[]>;

@Injectable({ providedIn: 'root' })
export class GatewayService {
    public resourceUrl = SERVER_API_URL + 'api/gateways';

    constructor(protected http: HttpClient) {}

    create(gateway: IGateway): Observable<EntityResponseType> {
        return this.http.post<IGateway>(this.resourceUrl, gateway, { observe: 'response' });
    }

    update(gateway: IGateway): Observable<EntityResponseType> {
        return this.http.put<IGateway>(this.resourceUrl, gateway, { observe: 'response' });
    }

    find(id: number): Observable<EntityResponseType> {
        return this.http.get<IGateway>(`${this.resourceUrl}/${id}`, { observe: 'response' });
    }

    query(req?: any): Observable<EntityArrayResponseType> {
        const options = createRequestOption(req);
        return this.http.get<IGateway[]>(this.resourceUrl, { params: options, observe: 'response' });
    }

    delete(id: number): Observable<HttpResponse<any>> {
        return this.http.delete<any>(`${this.resourceUrl}/${id}`, { observe: 'response' });
    }
}

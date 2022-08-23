import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApplicationConfigService } from 'app/core/config/application-config.service';

import { createRequestOption } from 'app/shared/util/request-util';
import { IConnection } from 'app/shared/model/connection.model';

type EntityResponseType = HttpResponse<IConnection>;
type EntityArrayResponseType = HttpResponse<IConnection[]>;

@Injectable({ providedIn: 'root' })
export class ConnectionService {
    public resourceUrl = this.applicationConfigService.getEndpointFor('api/connections');

    constructor(protected http: HttpClient, private applicationConfigService: ApplicationConfigService) {}

    create(connection: IConnection): Observable<EntityResponseType> {
        return this.http.post<IConnection>(this.resourceUrl, connection, { observe: 'response' });
    }

    update(connection: IConnection): Observable<EntityResponseType> {
        return this.http.put<IConnection>(this.resourceUrl, connection, { observe: 'response' });
    }

    find(id: number): Observable<EntityResponseType> {
        return this.http.get<IConnection>(`${this.resourceUrl}/${id}`, { observe: 'response' });
    }

    query(req?: any): Observable<EntityArrayResponseType> {
        const options = createRequestOption(req);
        return this.http.get<IConnection[]>(this.resourceUrl, { params: options, observe: 'response' });
    }

    getConnectionKeys(id: number): Observable<HttpResponse<any>> {
        return this.http.get<any>(`${this.resourceUrl}/${id}/keys`, { observe: 'response' });
    }

    getAllConnections(): Observable<EntityArrayResponseType> {
        return this.http.get<IConnection[]>(`${this.resourceUrl}/getallconnections`, { observe: 'response' });
    }

    delete(id: number): Observable<HttpResponse<any>> {
        return this.http.delete<any>(`${this.resourceUrl}/${id}`, { observe: 'response' });
    }
}

import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApplicationConfigService } from 'app/core/config/application-config.service';

import { createRequestOption } from 'app/shared/util/request-util';
import { IConnectionKeys } from 'app/shared/model/connection-keys.model';

type EntityResponseType = HttpResponse<IConnectionKeys>;
type EntityArrayResponseType = HttpResponse<IConnectionKeys[]>;

@Injectable({ providedIn: 'root' })
export class ConnectionKeysService {
    public resourceUrl = this.applicationConfigService.getEndpointFor('api/connection-keys');

    constructor(protected http: HttpClient, private applicationConfigService: ApplicationConfigService) {}

    create(connectionKeys: IConnectionKeys): Observable<EntityResponseType> {
        return this.http.post<IConnectionKeys>(this.resourceUrl, connectionKeys, { observe: 'response' });
    }

    update(connectionKeys: IConnectionKeys): Observable<EntityResponseType> {
        return this.http.put<IConnectionKeys>(this.resourceUrl, connectionKeys, { observe: 'response' });
    }

    find(id: number): Observable<EntityResponseType> {
        return this.http.get<IConnectionKeys>(`${this.resourceUrl}/${id}`, { observe: 'response' });
    }

    query(req?: any): Observable<EntityArrayResponseType> {
        const options = createRequestOption(req);
        return this.http.get<IConnectionKeys[]>(this.resourceUrl, { params: options, observe: 'response' });
    }

    delete(id: number): Observable<HttpResponse<any>> {
        return this.http.delete<any>(`${this.resourceUrl}/${id}`, { observe: 'response' });
    }
}

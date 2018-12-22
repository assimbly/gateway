import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { SERVER_API_URL } from 'app/app.constants';
import { createRequestOption } from 'app/shared';
import { IServiceKeys } from 'app/shared/model/service-keys.model';

type EntityResponseType = HttpResponse<IServiceKeys>;
type EntityArrayResponseType = HttpResponse<IServiceKeys[]>;

@Injectable({ providedIn: 'root' })
export class ServiceKeysService {
    public resourceUrl = SERVER_API_URL + 'api/service-keys';

    constructor(protected http: HttpClient) {}

    create(serviceKeys: IServiceKeys): Observable<EntityResponseType> {
        return this.http.post<IServiceKeys>(this.resourceUrl, serviceKeys, { observe: 'response' });
    }

    update(serviceKeys: IServiceKeys): Observable<EntityResponseType> {
        return this.http.put<IServiceKeys>(this.resourceUrl, serviceKeys, { observe: 'response' });
    }

    find(id: number): Observable<EntityResponseType> {
        return this.http.get<IServiceKeys>(`${this.resourceUrl}/${id}`, { observe: 'response' });
    }

    query(req?: any): Observable<EntityArrayResponseType> {
        const options = createRequestOption(req);
        return this.http.get<IServiceKeys[]>(this.resourceUrl, { params: options, observe: 'response' });
    }

    delete(id: number): Observable<HttpResponse<any>> {
        return this.http.delete<any>(`${this.resourceUrl}/${id}`, { observe: 'response' });
    }
}

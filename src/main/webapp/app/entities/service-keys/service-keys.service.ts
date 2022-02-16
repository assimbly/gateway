import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApplicationConfigService } from 'app/core/config/application-config.service';

import { createRequestOption } from 'app/shared/util/request-util';
import { IServiceKeys } from 'app/shared/model/service-keys.model';

type EntityResponseType = HttpResponse<IServiceKeys>;
type EntityArrayResponseType = HttpResponse<IServiceKeys[]>;

@Injectable({ providedIn: 'root' })
export class ServiceKeysService {
    public resourceUrl = this.applicationConfigService.getEndpointFor('api/service-keys');

    constructor(protected http: HttpClient, private applicationConfigService: ApplicationConfigService) {}

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

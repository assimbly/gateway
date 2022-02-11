import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApplicationConfigService } from 'app/core/config/application-config.service';

import { createRequestOption } from 'app/shared';
import { IHeaderKeys } from 'app/shared/model/header-keys.model';

type EntityResponseType = HttpResponse<IHeaderKeys>;
type EntityArrayResponseType = HttpResponse<IHeaderKeys[]>;

@Injectable({ providedIn: 'root' })
export class HeaderKeysService {
    public resourceUrl = this.applicationConfigService +'api/header-keys';

    constructor(protected http: HttpClient, private applicationConfigService: ApplicationConfigService) {}

    create(headerKeys: IHeaderKeys): Observable<EntityResponseType> {
        return this.http.post<IHeaderKeys>(this.resourceUrl, headerKeys, { observe: 'response' });
    }

    update(headerKeys: IHeaderKeys): Observable<EntityResponseType> {
        return this.http.put<IHeaderKeys>(this.resourceUrl, headerKeys, { observe: 'response' });
    }

    find(id: number): Observable<EntityResponseType> {
        return this.http.get<IHeaderKeys>(`${this.resourceUrl}/${id}`, { observe: 'response' });
    }

    query(req?: any): Observable<EntityArrayResponseType> {
        const options = createRequestOption(req);
        return this.http.get<IHeaderKeys[]>(this.resourceUrl, { params: options, observe: 'response' });
    }

    delete(id: number): Observable<HttpResponse<any>> {
        return this.http.delete<any>(`${this.resourceUrl}/${id}`, { observe: 'response' });
    }
}

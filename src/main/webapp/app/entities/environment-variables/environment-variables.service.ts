import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApplicationConfigService } from 'app/core/config/application-config.service';

import { createRequestOption } from 'app/shared';
import { IEnvironmentVariables } from 'app/shared/model/environment-variables.model';

type EntityResponseType = HttpResponse<IEnvironmentVariables>;
type EntityArrayResponseType = HttpResponse<IEnvironmentVariables[]>;

@Injectable({ providedIn: 'root' })
export class EnvironmentVariablesService {
    public resourceUrl = this.applicationConfigService +'api/environment-variables';

    constructor(protected http: HttpClient, private applicationConfigService: ApplicationConfigService) {}

    create(environmentVariables: IEnvironmentVariables): Observable<EntityResponseType> {
        return this.http.post<IEnvironmentVariables>(this.resourceUrl, environmentVariables, { observe: 'response' });
    }

    update(environmentVariables: IEnvironmentVariables): Observable<EntityResponseType> {
        return this.http.put<IEnvironmentVariables>(this.resourceUrl, environmentVariables, { observe: 'response' });
    }

    find(id: number): Observable<EntityResponseType> {
        return this.http.get<IEnvironmentVariables>(`${this.resourceUrl}/${id}`, { observe: 'response' });
    }

    query(req?: any): Observable<EntityArrayResponseType> {
        const options = createRequestOption(req);
        return this.http.get<IEnvironmentVariables[]>(this.resourceUrl, { params: options, observe: 'response' });
    }

    delete(id: number): Observable<HttpResponse<any>> {
        return this.http.delete<any>(`${this.resourceUrl}/${id}`, { observe: 'response' });
    }
}

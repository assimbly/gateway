import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApplicationConfigService } from 'app/core/config/application-config.service';

import { createRequestOption } from 'app/shared/util/request-util';
import { IService } from 'app/shared/model/service.model';

type EntityResponseType = HttpResponse<IService>;
type EntityArrayResponseType = HttpResponse<IService[]>;

@Injectable({ providedIn: 'root' })
export class ServiceService {
    public resourceUrl = this.applicationConfigService.getEndpointFor('api/services');

    constructor(protected http: HttpClient, private applicationConfigService: ApplicationConfigService) {}

    create(service: IService): Observable<EntityResponseType> {
        return this.http.post<IService>(this.resourceUrl, service, { observe: 'response' });
    }

    update(service: IService): Observable<EntityResponseType> {
        return this.http.put<IService>(this.resourceUrl, service, { observe: 'response' });
    }

    find(id: number): Observable<EntityResponseType> {
        return this.http.get<IService>(`${this.resourceUrl}/${id}`, { observe: 'response' });
    }

    query(req?: any): Observable<EntityArrayResponseType> {
        const options = createRequestOption(req);
        return this.http.get<IService[]>(this.resourceUrl, { params: options, observe: 'response' });
    }

    getServiceKeys(id: number): Observable<HttpResponse<any>> {
        return this.http.get<any>(`${this.resourceUrl}/${id}/keys`, { observe: 'response' });
    }

    getAllServices(): Observable<EntityArrayResponseType> {
        return this.http.get<IService[]>(`${this.resourceUrl}/getallservices`, { observe: 'response' });
    }

    delete(id: number): Observable<HttpResponse<any>> {
        return this.http.delete<any>(`${this.resourceUrl}/${id}`, { observe: 'response' });
    }
}

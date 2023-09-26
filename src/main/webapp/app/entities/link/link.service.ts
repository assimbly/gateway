import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApplicationConfigService } from 'app/core/config/application-config.service';

import { createRequestOption } from 'app/shared/util/request-util';
import { ILink } from 'app/shared/model/link.model';

type EntityResponseType = HttpResponse<ILink>;
type EntityArrayResponseType = HttpResponse<ILink[]>;

@Injectable({ providedIn: 'root' })
export class LinkService {

    public resourceUrl = this.applicationConfigService.getEndpointFor('api/link');

    constructor(protected http: HttpClient, private applicationConfigService: ApplicationConfigService) {}

    create(link: ILink): Observable<EntityResponseType> {
        return this.http.post<ILink>(this.resourceUrl, link, { observe: 'response' });
    }

    update(link: ILink): Observable<EntityResponseType> {
        return this.http.put<ILink>(this.resourceUrl, link, { observe: 'response' });
    }

    find(id: number): Observable<EntityResponseType> {
        return this.http.get<ILink>(`${this.resourceUrl}/${id}`, { observe: 'response' });
    }

    query(req?: any): Observable<EntityArrayResponseType> {
        const options = createRequestOption(req);
        return this.http.get<ILink[]>(this.resourceUrl, { params: options, observe: 'response' });
    }

    delete(id: number): Observable<HttpResponse<any>> {
        return this.http.delete<any>(`${this.resourceUrl}/${id}`, { observe: 'response' });
    }

    deleteByStepId(stepid: number): Observable<HttpResponse<any>> {
        return this.http.delete<any>(`${this.resourceUrl}/bystepid/${stepid}`, { observe: 'response' });
    }

}

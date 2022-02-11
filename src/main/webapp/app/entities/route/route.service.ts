import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApplicationConfigService } from 'app/core/config/application-config.service';

import { createRequestOption } from 'app/shared/util/request-util';
import { IRoute, Route } from 'app/shared/model/route.model';

type EntityResponseType = HttpResponse<IRoute>;
type EntityArrayResponseType = HttpResponse<IRoute[]>;

@Injectable({ providedIn: 'root' })
export class RouteService {
    public resourceUrl = this.applicationConfigService +'api/routes';

    constructor(protected http: HttpClient, private applicationConfigService: ApplicationConfigService) {}

    create(route: IRoute): Observable<EntityResponseType> {
        return this.http.post<IRoute>(this.resourceUrl, route, { observe: 'response' });
    }

    update(route: IRoute): Observable<EntityResponseType> {
        return this.http.put<IRoute>(this.resourceUrl, route, { observe: 'response' });
    }

    find(id: number): Observable<EntityResponseType> {
        return this.http.get<IRoute>(`${this.resourceUrl}/${id}`, { observe: 'response' });
    }

    query(req?: any): Observable<EntityArrayResponseType> {
        const options = createRequestOption(req);
        return this.http.get<IRoute[]>(this.resourceUrl, { params: options, observe: 'response' });
    }

    delete(id: number): Observable<HttpResponse<{}>> {
        return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
    }

    getAllRoutes(): Observable<EntityArrayResponseType> {
        return this.http.get<Route[]>(`${this.resourceUrl}/getallroutes`, { observe: 'response' });
    }
}

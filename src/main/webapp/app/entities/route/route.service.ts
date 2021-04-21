import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { SERVER_API_URL } from 'app/app.constants';
import { createRequestOption } from 'app/shared/util/request-util';
import { IRoute } from 'app/shared/model/route.model';

type EntityResponseType = HttpResponse<IRoute>;
type EntityArrayResponseType = HttpResponse<IRoute[]>;

@Injectable({ providedIn: 'root' })
export class RouteService {
    public resourceUrl = SERVER_API_URL + 'api/routes';

    constructor(protected http: HttpClient) {}

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
}

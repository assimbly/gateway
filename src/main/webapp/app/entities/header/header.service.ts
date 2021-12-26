import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { SERVER_API_URL } from 'app/app.constants';
import { createRequestOption } from 'app/shared';
import { IHeader } from 'app/shared/model/header.model';

type EntityResponseType = HttpResponse<IHeader>;
type EntityArrayResponseType = HttpResponse<IHeader[]>;

@Injectable({ providedIn: 'root' })
export class HeaderService {
    public resourceUrl = SERVER_API_URL + 'api/headers';

    constructor(protected http: HttpClient) {}

    create(header: IHeader): Observable<EntityResponseType> {
        return this.http.post<IHeader>(this.resourceUrl, header, { observe: 'response' });
    }

    update(header: IHeader): Observable<EntityResponseType> {
        return this.http.put<IHeader>(this.resourceUrl, header, { observe: 'response' });
    }

    find(id: number): Observable<EntityResponseType> {
        return this.http.get<IHeader>(`${this.resourceUrl}/${id}`, { observe: 'response' });
    }

    query(req?: any): Observable<EntityArrayResponseType> {
        const options = createRequestOption(req);
        return this.http.get<IHeader[]>(this.resourceUrl, { params: options, observe: 'response' });
    }

    getAllHeaders(): Observable<EntityArrayResponseType> {
        return this.http.get<IHeader[]>(`${this.resourceUrl}/getallheaders`, { observe: 'response' });
    }

    getHeaderKeys(id: number): Observable<HttpResponse<any>> {
        return this.http.get<any>(`${this.resourceUrl}/${id}/keys`, { observe: 'response' });
    }

    delete(id: number): Observable<HttpResponse<any>> {
        return this.http.delete<any>(`${this.resourceUrl}/${id}`, { observe: 'response' });
    }
}

import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { SERVER_API_URL } from 'app/app.constants';
import { createRequestOption } from 'app/shared/util/request-util';
import { IQueue } from 'app/shared/model/queue.model';

type EntityResponseType = HttpResponse<IQueue>;
type EntityArrayResponseType = HttpResponse<IQueue[]>;

@Injectable({ providedIn: 'root' })
export class QueueService {
    public resourceUrl = SERVER_API_URL + 'api/queues';

    constructor(protected http: HttpClient) {}

    create(queue: IQueue): Observable<EntityResponseType> {
        return this.http.post<IQueue>(this.resourceUrl, queue, { observe: 'response' });
    }

    update(queue: IQueue): Observable<EntityResponseType> {
        return this.http.put<IQueue>(this.resourceUrl, queue, { observe: 'response' });
    }

    find(id: number): Observable<EntityResponseType> {
        return this.http.get<IQueue>(`${this.resourceUrl}/${id}`, { observe: 'response' });
    }

    query(req?: any): Observable<EntityArrayResponseType> {
        const options = createRequestOption(req);
        return this.http.get<IQueue[]>(this.resourceUrl, { params: options, observe: 'response' });
    }

    delete(id: number): Observable<HttpResponse<{}>> {
        return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
    }
}

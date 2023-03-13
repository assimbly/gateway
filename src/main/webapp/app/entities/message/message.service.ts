import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApplicationConfigService } from 'app/core/config/application-config.service';

import { createRequestOption } from 'app/shared/util/request-util';
import { IMessage } from 'app/shared/model/message.model';

type EntityResponseType = HttpResponse<IMessage>;
type EntityArrayResponseType = HttpResponse<IMessage[]>;

@Injectable({ providedIn: 'root' })
export class MessageService {
    public resourceUrl = this.applicationConfigService.getEndpointFor('api/messages');

    constructor(protected http: HttpClient, private applicationConfigService: ApplicationConfigService) {}

    create(message: IMessage): Observable<EntityResponseType> {
        return this.http.post<IMessage>(this.resourceUrl, message, { observe: 'response' });
    }

    update(message: IMessage): Observable<EntityResponseType> {
        return this.http.put<IMessage>(this.resourceUrl, message, { observe: 'response' });
    }

    find(id: number): Observable<EntityResponseType> {
        return this.http.get<IMessage>(`${this.resourceUrl}/${id}`, { observe: 'response' });
    }

    query(req?: any): Observable<EntityArrayResponseType> {
        const options = createRequestOption(req);
        return this.http.get<IMessage[]>(this.resourceUrl, { params: options, observe: 'response' });
    }

    getAllMessages(): Observable<EntityArrayResponseType> {
        return this.http.get<IMessage[]>(`${this.resourceUrl}/getallmessages`, { observe: 'response' });
    }

    getHeader(id: number): Observable<HttpResponse<any>> {
        return this.http.get<any>(`${this.resourceUrl}/${id}/headers`, { observe: 'response' });
    }

    delete(id: number): Observable<HttpResponse<any>> {
        return this.http.delete<any>(`${this.resourceUrl}/${id}`, { observe: 'response' });
    }
}

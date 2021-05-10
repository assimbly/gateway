import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { SERVER_API_URL } from 'app/app.constants';
import { createRequestOption } from 'app/shared';
import { IBroker } from 'app/shared/model/broker.model';
import { HttpHeaders } from '@angular/common/http';

type EntityResponseType = HttpResponse<IBroker>;
type EntityArrayResponseType = HttpResponse<IBroker[]>;

@Injectable({ providedIn: 'root' })
export class BrokerService {
    public resourceUrl = SERVER_API_URL + 'api/brokers';
    public connectorUrl = SERVER_API_URL + 'api/connector';

    private gatewayid = 1;

    constructor(protected http: HttpClient) {}

    create(broker: IBroker): Observable<EntityResponseType> {
        return this.http.post<IBroker>(this.resourceUrl, broker, { observe: 'response' });
    }

    update(broker: IBroker): Observable<EntityResponseType> {
        return this.http.put<IBroker>(this.resourceUrl, broker, { observe: 'response' });
    }

    find(id: number): Observable<EntityResponseType> {
        return this.http.get<IBroker>(`${this.resourceUrl}/${id}`, { observe: 'response' });
    }

    query(req?: any): Observable<EntityArrayResponseType> {
        const options = createRequestOption(req);
        return this.http.get<IBroker[]>(this.resourceUrl, { params: options, observe: 'response' });
    }

    delete(id: number): Observable<HttpResponse<any>> {
        return this.http.delete<any>(`${this.resourceUrl}/${id}`, { observe: 'response' });
    }

    start(id: number, brokerType: string, brokerConfigurationType: string): Observable<HttpResponse<any>> {
        return this.http.get(`${this.resourceUrl}/${id}/start`, {
            observe: 'response',
            responseType: 'text',
            params: { brokerType: brokerType, brokerConfigurationType: brokerConfigurationType }
        });
    }

    restart(id: number, brokerType: string, brokerConfigurationType: string): Observable<HttpResponse<any>> {
        return this.http.get(`${this.resourceUrl}/${id}/restart`, {
            observe: 'response',
            responseType: 'text',
            params: { brokerType: brokerType, brokerConfigurationType: brokerConfigurationType }
        });
    }

    stop(id: number, brokerType: string, brokerConfigurationType: string): Observable<HttpResponse<any>> {
        return this.http.get(`${this.resourceUrl}/${id}/stop`, {
            observe: 'response',
            responseType: 'text',
            params: { brokerType: brokerType, brokerConfigurationType: brokerConfigurationType }
        });
    }

    getBrokerStatus(id: number, brokerType: string): Observable<any> {
        return this.http.get(`${this.resourceUrl}/${id}/status`, {
            observe: 'response',
            responseType: 'text',
            params: { brokerType: brokerType }
        });
    }

    getBrokerType(id: number): Observable<any> {
        return this.http.get(`${this.resourceUrl}/${id}/type`, { observe: 'response', responseType: 'text' });
    }

    getBrokerInfo(id: number, brokerType: string): Observable<any> {
        return this.http.get(`${this.resourceUrl}/${id}/info`, {
            observe: 'response',
            responseType: 'text',
            params: { brokerType: brokerType }
        });
    }

    getBrokerConfiguration(id: number, brokerType: string): Observable<any> {
        return this.http.get(`${this.resourceUrl}/${id}/getconfiguration`, {
            observe: 'response',
            responseType: 'text',
            params: { brokerType: brokerType }
        });
    }

    setBrokerConfiguration(id: number, brokerType: string, brokerConfiguration: String): Observable<HttpResponse<any>> {
        const options = {};
        return this.http.post(`${this.resourceUrl}/${id}/setconfiguration`, brokerConfiguration, {
            observe: 'response',
            responseType: 'text',
            params: { brokerType: brokerType }
        });
    }
}

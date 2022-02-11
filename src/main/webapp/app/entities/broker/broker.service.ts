import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApplicationConfigService } from 'app/core/config/application-config.service';

import { createRequestOption } from 'app/shared';
import { IBroker } from 'app/shared/model/broker.model';

type EntityResponseType = HttpResponse<IBroker>;
type EntityArrayResponseType = HttpResponse<IBroker[]>;

@Injectable({ providedIn: 'root' })
export class BrokerService {
    public resourceUrl = this.applicationConfigService +'api/brokers';

    private gatewayid = 1;

    constructor(protected http: HttpClient, private applicationConfigService: ApplicationConfigService) {}

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
            params: { brokerType, brokerConfigurationType }
        });
    }

    restart(id: number, brokerType: string, brokerConfigurationType: string): Observable<HttpResponse<any>> {
        return this.http.get(`${this.resourceUrl}/${id}/restart`, {
            observe: 'response',
            responseType: 'text',
            params: { brokerType, brokerConfigurationType }
        });
    }

    stop(id: number, brokerType: string, brokerConfigurationType: string): Observable<HttpResponse<any>> {
        return this.http.get(`${this.resourceUrl}/${id}/stop`, {
            observe: 'response',
            responseType: 'text',
            params: { brokerType, brokerConfigurationType }
        });
    }

    getBrokers(): Observable<HttpResponse<IBroker[]>> {
        return this.http.get<IBroker[]>(`${this.resourceUrl}`, {
            headers: new HttpHeaders({ PlaceholderReplacement: 'true', Accept: 'application/json' }),
            observe: 'response'
        });
    }

    getBrokerStatus(id: number, brokerType: string): Observable<any> {
        return this.http.get(`${this.resourceUrl}/${id}/status`, {
            observe: 'response',
            responseType: 'text',
            params: { brokerType }
        });
    }

    getBrokerType(id: number): Observable<any> {
        return this.http.get(`${this.resourceUrl}/${id}/type`, { observe: 'response', responseType: 'text' });
    }

    getBrokerInfo(id: number, brokerType: string): Observable<any> {
        return this.http.get(`${this.resourceUrl}/${id}/info`, {
            observe: 'response',
            responseType: 'text',
            params: { brokerType }
        });
    }

    getBrokerConfiguration(id: number, brokerType: string): Observable<any> {
        return this.http.get(`${this.resourceUrl}/${id}/getconfiguration`, {
            observe: 'response',
            responseType: 'text',
            params: { brokerType }
        });
    }

    setBrokerConfiguration(
        id: number,
        brokerType: string,
        brokerConfigurationType: string,
        brokerConfiguration: String
    ): Observable<HttpResponse<any>> {
        const options = {};
        return this.http.post(`${this.resourceUrl}/${id}/setconfiguration`, brokerConfiguration, {
            observe: 'response',
            responseType: 'text',
            params: { brokerType, brokerConfigurationType }
        });
    }

    countMessages(brokerType: string, endpointName: string): Observable<any> {
        return this.http.get(`${this.resourceUrl}/${brokerType}/messages/${endpointName}/count`, {
            observe: 'response'
        });
    }

    browseMessages(
        brokerType: string,
        endpointName: string,
        page: number,
        numberOfMessages: number,
        excludeBody: boolean
    ): Observable<any> {
        return this.http.get(`${this.resourceUrl}/${brokerType}/messages/${endpointName}/browse`, {
            observe: 'response',
            params: { page: page.toString(), numberOfMessages: numberOfMessages.toString(), excludeBody: excludeBody.toString() }
        });
    }

    browseMessage(brokerType: string, endpointName: string, messageid: string): Observable<any> {
        return this.http.get(`${this.resourceUrl}/${brokerType}/message/${endpointName}/browse/${messageid}`, {
            observe: 'response'
        });
    }

    deleteMessage(brokerType: string, endpointName: string, messageid: string): Observable<any> {
        return this.http.delete<any>(`${this.resourceUrl}/${brokerType}/message/${endpointName}/${messageid}`, {
            observe: 'response'
        });
    }

    moveMessage(brokerType: string, endpointName: string, targetEndpointName: string, messageid: string): Observable<any> {
        return this.http.post<any>(`${this.resourceUrl}/${brokerType}/message/${endpointName}/${targetEndpointName}/${messageid}`, '', {
            observe: 'response'
        });
    }

    sendMessage(brokerType: string, endpointName: string, messageHeaders: string, messageBody: string): Observable<any> {
        return this.http.post(`${this.resourceUrl}/${brokerType}/message/${endpointName}/send`, messageBody, {
            observe: 'response',
            responseType: 'text',
            params: { messageHeaders }
        });
    }
}

import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import { SERVER_API_URL } from 'app/app.constants';
import { createRequestOption } from 'app/shared';
import { IGateway } from 'app/shared/model/gateway.model';

type EntityResponseType = HttpResponse<IGateway>;
type EntityArrayResponseType = HttpResponse<IGateway[]>;

@Injectable({ providedIn: 'root' })
export class GatewayService {
    public resourceUrl = SERVER_API_URL + 'api/gateways';
    public environmentUrl = SERVER_API_URL + 'api/environment';
    public connectorUrl = SERVER_API_URL + 'api/connector';

    constructor(protected http: HttpClient) {}

    stop(id: number): Observable<HttpResponse<any>> {
        return this.http.get(`${this.connectorUrl}/${id}/stop`, { observe: 'response', responseType: 'text' });
    }

    start(id: number): Observable<HttpResponse<any>> {
        return this.http.get(`${this.connectorUrl}/${id}/start`, { observe: 'response', responseType: 'text' });
    }

    create(gateway: IGateway): Observable<EntityResponseType> {
        return this.http.post<IGateway>(this.resourceUrl, gateway, { observe: 'response' });
    }

    update(gateway: IGateway): Observable<EntityResponseType> {
        return this.http.put<IGateway>(this.resourceUrl, gateway, { observe: 'response' });
    }

    find(id: number): Observable<EntityResponseType> {
        return this.http.get<IGateway>(`${this.resourceUrl}/${id}`, { observe: 'response' });
    }

    query(req?: any): Observable<EntityArrayResponseType> {
        const options = createRequestOption(req);
        return this.http.get<IGateway[]>(this.resourceUrl, { params: options, observe: 'response' });
    }

    delete(id: number): Observable<HttpResponse<any>> {
        return this.http.delete<any>(`${this.resourceUrl}/${id}`, { observe: 'response' });
    }

    setGatewayConfiguration(gatewayid, configuration): Observable<any> {
        const options = {
            headers: new HttpHeaders({ observe: 'response', 'Content-Type': 'application/xml', Accept: 'application/json' })
        };
        return this.http.post(`${this.environmentUrl}/${gatewayid}`, configuration, options);
    }

    updateBackupFrequency(gatewayid, frequency, url): Observable<any> {
        try {
            const options = {
                headers: new HttpHeaders({ observe: 'response', 'Content-Type': 'application/xml', Accept: 'application/json' })
            };
            return this.http.post(`${this.resourceUrl}/${gatewayid}/updatebackup/${frequency}`, url, options);
        } catch (e) {
            console.log(e);
        }
    }
}

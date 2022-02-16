import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApplicationConfigService } from 'app/core/config/application-config.service';

import { createRequestOption } from 'app/shared/util/request-util';
import { IGateway } from 'app/shared/model/gateway.model';

type EntityResponseType = HttpResponse<IGateway>;
type EntityArrayResponseType = HttpResponse<IGateway[]>;

@Injectable({ providedIn: 'root' })
export class GatewayService {
    public resourceUrl = this.applicationConfigService.getEndpointFor('api/gateways');
    public environmentUrl = this.applicationConfigService.getEndpointFor('api/environment');
    public integrationUrl = this.applicationConfigService.getEndpointFor('api/integration');

    constructor(protected http: HttpClient, private applicationConfigService: ApplicationConfigService) {}

    stop(id: number): Observable<HttpResponse<any>> {
        return this.http.get(`${this.integrationUrl}/${id}/stop`, { observe: 'response', responseType: 'text' });
    }

    start(id: number): Observable<HttpResponse<any>> {
        return this.http.get(`${this.integrationUrl}/${id}/start`, { observe: 'response', responseType: 'text' });
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
        const options = {
            headers: new HttpHeaders({ observe: 'response', 'Content-Type': 'application/xml', Accept: 'application/json' })
        };
        return this.http.post(`${this.resourceUrl}/${gatewayid}/updatebackup/${frequency}`, url, options);
    }
}

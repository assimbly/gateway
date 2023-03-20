import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApplicationConfigService } from 'app/core/config/application-config.service';

import { createRequestOption } from 'app/shared/util/request-util';
import { IIntegration } from 'app/shared/model/integration.model';

type EntityResponseType = HttpResponse<IIntegration>;
type EntityArrayResponseType = HttpResponse<IIntegration[]>;

@Injectable({ providedIn: 'root' })
export class IntegrationService {
    public resourceUrl = this.applicationConfigService.getEndpointFor('api/integrations');
    public environmentUrl = this.applicationConfigService.getEndpointFor('api/environment');
    public integrationUrl = this.applicationConfigService.getEndpointFor('api/integration');

    constructor(protected http: HttpClient, private applicationConfigService: ApplicationConfigService) {}

    stop(id: number): Observable<HttpResponse<any>> {
        return this.http.get(`${this.integrationUrl}/${id}/stop`, { observe: 'response', responseType: 'text' });
    }

    start(id: number): Observable<HttpResponse<any>> {
        return this.http.get(`${this.integrationUrl}/${id}/start`, { observe: 'response', responseType: 'text' });
    }

    create(integration: IIntegration): Observable<EntityResponseType> {
        return this.http.post<IIntegration>(this.resourceUrl, integration, { observe: 'response' });
    }

    update(integration: IIntegration): Observable<EntityResponseType> {
        return this.http.put<IIntegration>(this.resourceUrl, integration, { observe: 'response' });
    }

    find(id: number): Observable<EntityResponseType> {
        return this.http.get<IIntegration>(`${this.resourceUrl}/${id}`, { observe: 'response' });
    }

    query(req?: any): Observable<EntityArrayResponseType> {
		const options = createRequestOption(req);
        return this.http.get<IIntegration[]>(this.resourceUrl, { params: options, observe: 'response' });
    }

    delete(id: number): Observable<HttpResponse<any>> {
        return this.http.delete<any>(`${this.resourceUrl}/${id}`, { observe: 'response' });
    }

    setIntegrationConfiguration(integrationid, configuration): Observable<any> {
        const options = {
            headers: new HttpHeaders({ observe: 'response', 'Content-Type': 'application/xml', Accept: 'application/json' })
        };
        return this.http.post(`${this.environmentUrl}/${integrationid}`, configuration, options);
    }

    updateBackupFrequency(integrationid, frequency, url): Observable<any> {
        const options = {
            headers: new HttpHeaders({ observe: 'response', 'Content-Type': 'application/xml', Accept: 'application/json' })
        };
        return this.http.post(`${this.resourceUrl}/${integrationid}/updatebackup/${frequency}`, url, options);
    }
}

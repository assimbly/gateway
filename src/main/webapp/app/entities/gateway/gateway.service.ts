import { Injectable } from '@angular/core';
import { SERVER_API_URL } from '../../app.constants';
import { HttpClient, HttpResponse, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { createRequestOption } from 'app/shared';
import { IGateway, Gateway } from 'app/shared/model/gateway.model';

type EntityResponseType = HttpResponse<Gateway>;
type EntityArrayResponseType = HttpResponse<Gateway[]>;

@Injectable({ providedIn: 'root' })
export class GatewayService {

    private resourceUrl =  SERVER_API_URL + 'api/gateways';
    private environmentUrl  = SERVER_API_URL + 'api/environment';
    
    constructor(protected http: HttpClient) {}

    create(gateway: IGateway): Observable<EntityResponseType> {
        return this.http.post<IGateway>(this.resourceUrl, gateway, { observe: 'response' });
    }

    update(gateway: IGateway): Observable<EntityResponseType> {
        return this.http.put<IGateway>(this.resourceUrl, gateway, { observe: 'response' });
    }

    delete(id: number): Observable<HttpResponse<any>> {
        return this.http.delete<any>(`${this.resourceUrl}/${id}`, { observe: 'response' });
    }

    find(id: number): Observable<EntityResponseType> {
        return this.http.get<IGateway>(`${this.resourceUrl}/${id}`, { observe: 'response' });
    }

    query(req?: any): Observable<EntityArrayResponseType> {
        const options = createRequestOption(req);
        return this.http.get<IGateway[]>(this.resourceUrl, { params: options, observe: 'response' });
    }

    setGatewayConfiguration(gatewayid, configuration): Observable<HttpResponse<any>> {
        const options = {
                headers: new HttpHeaders({'Accept': 'application/xml'})
        };
        return this.http.post<any>(`${this.environmentUrl}/${gatewayid}`, configuration, options);
    }

    /**
     * Convert a returned JSON object to Gateway.
     */
    private convertItemFromServer(json: any): IGateway {
        const entity: IGateway = Object.assign(new Gateway(), json);
        return entity;
    }

}

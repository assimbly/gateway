import { Injectable } from '@angular/core';
import { Http, Response, RequestOptions, Headers } from '@angular/http';
import { SERVER_API_URL } from '../../app.constants';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { createRequestOption } from 'app/shared';
import { IGateway } from 'app/shared/model/gateway.model';


@Injectable({ providedIn: 'root' })
export class GatewayService {
    public resourceUrl = SERVER_API_URL + 'api/gateways';

    type EntityResponseType = HttpResponse<IGateway>;
    type EntityArrayResponseType = HttpResponse<IGateway[]>;

        private resourceUrl =  SERVER_API_URL + 'api/gateways';
        private environmentUrl  = SERVER_API_URL + 'api/environment'

        
    constructor(protected http: HttpClient) {}

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
        return this.http.get(this.resourceUrl, options)
            .map((res: Response) => this.convertResponse(res));
    }

    delete(id: number): Observable<Response> {
        return this.http.delete(`${this.resourceUrl}/${id}`);
    }

    setGatewayConfiguration(gatewayid, configuration): Observable<Response> {
        let headers = new Headers();
        headers.append('Accept', 'application/xml');
        let options = new RequestOptions();
        options.headers = headers;
        return this.http.post(`${this.environmentUrl}/${gatewayid}`, configuration, options);
    }

    private convertResponse(res: Response): ResponseWrapper {
        const jsonResponse = res.json();
        const result = [];
        for (let i = 0; i < jsonResponse.length; i++) {
            result.push(this.convertItemFromServer(jsonResponse[i]));
        }
        return new ResponseWrapper(res.headers, result, res.status);
    }

    /**
     * Convert a returned JSON object to Gateway.
     */
    private convertItemFromServer(json: any): Gateway {
        const entity: Gateway = Object.assign(new Gateway(), json);
        return entity;
    }

    delete(id: number): Observable<HttpResponse<any>> {
        return this.http.delete<any>(`${this.resourceUrl}/${id}`, { observe: 'response' });
    }
}

import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { SERVER_API_URL } from '../../app.constants';

import { JhiDateUtils } from 'ng-jhipster';

import { Maintenance } from './maintenance.model';
import { ResponseWrapper, createRequestOption } from '../../shared';

@Injectable()
export class MaintenanceService {

    private resourceUrl =  SERVER_API_URL + 'api/maintenances';

    constructor(private http: Http, private dateUtils: JhiDateUtils) { }

    create(maintenance: Maintenance): Observable<Maintenance> {
        const copy = this.convert(maintenance);
        return this.http.post(this.resourceUrl, copy).map((res: Response) => {
            const jsonResponse = res.json();
            return this.convertItemFromServer(jsonResponse);
        });
    }

    update(maintenance: Maintenance): Observable<Maintenance> {
        const copy = this.convert(maintenance);
        return this.http.put(this.resourceUrl, copy).map((res: Response) => {
            const jsonResponse = res.json();
            return this.convertItemFromServer(jsonResponse);
        });
    }

    find(id: number): Observable<Maintenance> {
        return this.http.get(`${this.resourceUrl}/${id}`).map((res: Response) => {
            const jsonResponse = res.json();
            return this.convertItemFromServer(jsonResponse);
        });
    }

    query(req?: any): Observable<ResponseWrapper> {
        const options = createRequestOption(req);
        return this.http.get(this.resourceUrl, options)
            .map((res: Response) => this.convertResponse(res));
    }

    delete(id: number): Observable<Response> {
        return this.http.delete(`${this.resourceUrl}/${id}`);
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
     * Convert a returned JSON object to Maintenance.
     */
    private convertItemFromServer(json: any): Maintenance {
        const entity: Maintenance = Object.assign(new Maintenance(), json);
        entity.startTime = this.dateUtils
            .convertDateTimeFromServer(json.startTime);
        entity.endTime = this.dateUtils
            .convertDateTimeFromServer(json.endTime);
        return entity;
    }

    /**
     * Convert a Maintenance to a JSON which can be sent to the server.
     */
    private convert(maintenance: Maintenance): Maintenance {
        const copy: Maintenance = Object.assign({}, maintenance);

        copy.startTime = this.dateUtils.toDate(maintenance.startTime);

        copy.endTime = this.dateUtils.toDate(maintenance.endTime);
        return copy;
    }
}

import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import * as moment from 'moment';
import { DATE_FORMAT } from 'app/shared/constants/input.constants';
import { map } from 'rxjs/operators';

import { SERVER_API_URL } from 'app/app.constants';
import { createRequestOption } from 'app/shared';
import { IMaintenance } from 'app/shared/model/maintenance.model';

type EntityResponseType = HttpResponse<IMaintenance>;
type EntityArrayResponseType = HttpResponse<IMaintenance[]>;

@Injectable({ providedIn: 'root' })
export class MaintenanceService {
    public resourceUrl = SERVER_API_URL + 'api/maintenances';

    constructor(protected http: HttpClient) {}

    create(maintenance: IMaintenance): Observable<EntityResponseType> {
        const copy = this.convertDateFromClient(maintenance);
        return this.http
            .post<IMaintenance>(this.resourceUrl, copy, { observe: 'response' })
            .pipe(map((res: EntityResponseType) => this.convertDateFromServer(res)));
    }

    update(maintenance: IMaintenance): Observable<EntityResponseType> {
        const copy = this.convertDateFromClient(maintenance);
        return this.http
            .put<IMaintenance>(this.resourceUrl, copy, { observe: 'response' })
            .pipe(map((res: EntityResponseType) => this.convertDateFromServer(res)));
    }

    find(id: number): Observable<EntityResponseType> {
        return this.http
            .get<IMaintenance>(`${this.resourceUrl}/${id}`, { observe: 'response' })
            .pipe(map((res: EntityResponseType) => this.convertDateFromServer(res)));
    }

    query(req?: any): Observable<EntityArrayResponseType> {
        const options = createRequestOption(req);
        return this.http
            .get<IMaintenance[]>(this.resourceUrl, { params: options, observe: 'response' })
            .pipe(map((res: EntityArrayResponseType) => this.convertDateArrayFromServer(res)));
    }

    delete(id: number): Observable<HttpResponse<any>> {
        return this.http.delete<any>(`${this.resourceUrl}/${id}`, { observe: 'response' });
    }

    protected convertDateFromClient(maintenance: IMaintenance): IMaintenance {
        const copy: IMaintenance = Object.assign({}, maintenance, {
            startTime: maintenance.startTime != null && maintenance.startTime.isValid() ? maintenance.startTime.toJSON() : null,
            endTime: maintenance.endTime != null && maintenance.endTime.isValid() ? maintenance.endTime.toJSON() : null,
            duration: maintenance.duration != null && maintenance.duration.isValid() ? maintenance.duration.toJSON() : null
        });
        return copy;
    }

    protected convertDateFromServer(res: EntityResponseType): EntityResponseType {
        if (res.body) {
            res.body.startTime = res.body.startTime != null ? moment(res.body.startTime) : null;
            res.body.endTime = res.body.endTime != null ? moment(res.body.endTime) : null;
            res.body.duration = res.body.duration != null ? moment(res.body.duration) : null;
        }
        return res;
    }

    protected convertDateArrayFromServer(res: EntityArrayResponseType): EntityArrayResponseType {
        if (res.body) {
            res.body.forEach((maintenance: IMaintenance) => {
                maintenance.startTime = maintenance.startTime != null ? moment(maintenance.startTime) : null;
                maintenance.endTime = maintenance.endTime != null ? moment(maintenance.endTime) : null;
                maintenance.duration = maintenance.duration != null ? moment(maintenance.duration) : null;
            });
        }
        return res;
    }
}

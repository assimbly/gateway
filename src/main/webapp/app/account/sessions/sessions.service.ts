import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import { Session } from './session.model';
import { SERVER_API_URL } from '../../app.constants';

@Injectable()
export class SessionsService {

    private resourceUrl = SERVER_API_URL + 'api/account/sessions/';
    constructor(private http: Http) { }

    findAll(): Observable<Session[]> {
        return this.http.get(this.resourceUrl).map((res: Response) => res.json());
    }

    delete(series: string): Observable<Response> {
        return this.http.delete(`${this.resourceUrl}${series}`);
    }
}

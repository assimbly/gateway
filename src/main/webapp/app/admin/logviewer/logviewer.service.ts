import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { serverApiUrl } from 'app/config/endpoint.constants';

@Injectable({ providedIn: 'root' })
export class LogViewerService {

    private integrationid = 1;

    constructor(protected http: HttpClient) {}

    getLogs(lines: number): Observable<HttpResponse<any>> {
        return this.http.get(`${serverApiUrl}api/logs/${this.integrationid}/log/${lines}`, {
            observe: 'response',
            responseType: 'text'
        });
    }
}

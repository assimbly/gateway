import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpHeaders } from '@angular/common/http';
import { Observable } from '../../../../../../node_modules/rxjs';
import { SERVER_API_URL } from '../../app.constants';

@Injectable()
export class LogViewerService {

    private gatewayid = 1;

    constructor(protected http: HttpClient) { }

    getLogs(lines: number): Observable<any> {
        return this.http.get(`${SERVER_API_URL}/api/environment/${this.gatewayid}/log/${lines}`, { observe: 'response' });
    }
}

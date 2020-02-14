import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpHeaders } from '@angular/common/http';
import { SERVER_API_URL } from 'app/app.constants';
import { Observable } from 'rxjs';

@Injectable()
export class LogViewerService {
    private gatewayid = 1;

    constructor(protected http: HttpClient) {}

    getLogs(lines: number): Observable<HttpResponse<any>> {
        return this.http.get(`${SERVER_API_URL}/api/environment/${this.gatewayid}/log/${lines}`, {
            observe: 'response',
            responseType: 'text'
        });
    }
}

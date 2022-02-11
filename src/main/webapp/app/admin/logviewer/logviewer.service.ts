import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpHeaders } from '@angular/common/http';
import { ApplicationConfigService } from 'app/core/config/application-config.service';

import { Observable } from 'rxjs';

@Injectable()
export class LogViewerService {
    private gatewayid = 1;

    constructor(protected http: HttpClient, private applicationConfigService: ApplicationConfigService) {}

    getLogs(lines: number): Observable<HttpResponse<any>> {
		const url = this.applicationConfigService + '/api/logs/'+ this.gatewayid + '/log/' + lines;
        return this.http.get(url, {
            observe: 'response',
            responseType: 'text'
        });
    }
}

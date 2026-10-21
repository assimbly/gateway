import { Injectable } from '@angular/core';
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { serverApiUrl } from 'app/config/endpoint.constants';

@Injectable({ providedIn: 'root' })
export class LogViewerService {

    private integrationid = 1;

    constructor(protected http: HttpClient) {}

    /** The last lines of the application log, or with a Flow id the last entries that Flow logged. */
    getLogs(lines: number, flowId?: number, context?: HttpContext): Observable<HttpResponse<string>> {
        return this.http.get(`${serverApiUrl}api/logs/${this.integrationid}/log/${lines}`, {
            params: flowId ? { flowId } : {},
            observe: 'response',
            responseType: 'text',
            context
        });
    }
}

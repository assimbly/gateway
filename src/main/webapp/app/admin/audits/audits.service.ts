import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { createRequestOption, Pagination } from 'app/shared/util/request-util';
import { ApplicationConfigService } from 'app/core/config/application-config.service';

import { Audit } from './audit.model';

export interface AuditsQuery extends Pagination {
  fromDate: string;
  toDate: string;
}

@Injectable({ providedIn: 'root' })
export class AuditsService {
  constructor(private http: HttpClient, private applicationConfigService: ApplicationConfigService) {}

  query(req: AuditsQuery): Observable<HttpResponse<Audit[]>> {
    const params: HttpParams = createRequestOption(req);

    const requestURL = this.applicationConfigService +'management/audits';

    return this.http.get<Audit[]>(requestURL, {
      params,
      observe: 'response',
    });
  }
}

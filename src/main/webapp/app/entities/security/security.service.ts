import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import * as moment from 'moment';
import { DATE_FORMAT } from 'app/config/input.constants';
import { map } from 'rxjs/operators';

import { SERVER_API_URL } from 'app/app.constants';
import { createRequestOption } from 'app/shared';
import { ISecurity } from 'app/shared/model/security.model';

type EntityResponseType = HttpResponse<ISecurity>;
type EntityArrayResponseType = HttpResponse<ISecurity[]>;

@Injectable({ providedIn: 'root' })
export class SecurityService {
  public resourceUrl = SERVER_API_URL + 'api/securities';
  public resourceCertificateUrl = SERVER_API_URL + 'api/certificates';

  constructor(protected http: HttpClient) {}

  create(security: ISecurity): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(security);
    return this.http
      .post<ISecurity>(this.resourceUrl, copy, { observe: 'response' })
      .pipe(map((res: EntityResponseType) => this.convertDateFromServer(res)));
  }

  update(security: ISecurity): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(security);
    return this.http
      .put<ISecurity>(this.resourceUrl, copy, { observe: 'response' })
      .pipe(map((res: EntityResponseType) => this.convertDateFromServer(res)));
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http
      .get<ISecurity>(`${this.resourceUrl}/${id}`, { observe: 'response' })
      .pipe(map((res: EntityResponseType) => this.convertDateFromServer(res)));
  }

  findAll(): Observable<HttpResponse<any>> {
    return this.http.get<any>(`${this.resourceUrl}/all`, { observe: 'response' });
  }

  findByUrl(url: string): Observable<HttpResponse<any>> {
    return this.http.post<any>(`${this.resourceUrl}/byurl`, url, { observe: 'response' });
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<ISecurity[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map((res: EntityArrayResponseType) => this.convertDateArrayFromServer(res)));
  }

  delete(id: number): Observable<HttpResponse<any>> {
    return this.http.delete<any>(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  remove(url: String): Observable<HttpResponse<any>> {
    return this.http.post<any>(`${this.resourceUrl}/remove`, url, { observe: 'response' });
  }

  getCertificateDetails(certificateName: string): Observable<HttpResponse<any>> {
    return this.http.get(`${this.resourceUrl}/details/${certificateName}`, { observe: 'response', responseType: 'text' });
  }

  /*
    syncTrustore(): Observable<HttpResponse<any>> {
         const options = new HttpHeaders({
            keystoreName: "keystore.jks",
            keystorePassword: "supersecret"
        });
        return this.http.post(`${this.resourceUrl}/syncTrustore`, '', { observe: 'response', responseType: 'text' });
    }*/

  updateTruststore(url: string): Observable<HttpResponse<any>> {
    const options = new HttpHeaders({
      keystoreName: 'keystore.jks',
      keystorePassword: 'supersecret',
    });

    return this.http.post(`${this.resourceCertificateUrl}/update`, url, { observe: 'response', responseType: 'text' });
  }

  uploadCertificate(keystoreName, certificate, fileType): Observable<HttpResponse<any>> {
    const options = new HttpHeaders({
      keystoreName,
      keystorePassword: 'supersecret',
      fileType,
    });
    return this.http.post(`${this.resourceCertificateUrl}/upload`, certificate, {
      headers: options,
      observe: 'response',
      responseType: 'text',
    });
  }

  uploadP12Certificate(keystoreName, certificate, fileType, password): Observable<HttpResponse<any>> {
    const options = new HttpHeaders({
      keystoreName,
      keystorePassword: 'supersecret',
      fileType,
      password,
    });

    return this.http.post(`${this.resourceCertificateUrl}/uploadp12`, certificate, {
      headers: options,
      observe: 'response',
      responseType: 'text',
    });
  }

  generateCertificate(keystoreName, cn): Observable<HttpResponse<any>> {
    const options = new HttpHeaders({
      keystoreName,
      keystorePassword: 'supersecret',
      cn,
    });

    return this.http.get(`${this.resourceCertificateUrl}/generate`, {
      headers: options,
      observe: 'response',
      responseType: 'text',
    });
  }

  importCertificate(url, keystoreName): Observable<HttpResponse<any>> {
    const options = new HttpHeaders({
      keystoreName,
      keystorePassword: 'supersecret',
    });

    return this.http.post(`${this.resourceCertificateUrl}/import`, url, {
      headers: options,
      observe: 'response',
      responseType: 'text',
    });
  }

  deleteCertificate(certificateName: String): Observable<HttpResponse<any>> {
    const options = new HttpHeaders({
      keystoreName: 'keystore.jks',
      keystorePassword: 'supersecret',
    });

    return this.http.get(`${this.resourceCertificateUrl}/delete/${certificateName}`, {
      headers: options,
      observe: 'response',
      responseType: 'text',
    });
  }

  protected convertDateFromClient(security: ISecurity): ISecurity {
    const copy: ISecurity = Object.assign({}, security, {
      certificateExpiry:
        security.certificateExpiry != null && security.certificateExpiry.isValid() ? security.certificateExpiry.toJSON() : null,
    });
    return copy;
  }

  protected convertDateFromServer(res: EntityResponseType): EntityResponseType {
    if (res.body) {
      res.body.certificateExpiry = res.body.certificateExpiry != null ? moment(res.body.certificateExpiry) : null;
    }
    return res;
  }

  protected convertDateArrayFromServer(res: EntityArrayResponseType): EntityArrayResponseType {
    if (res.body) {
      res.body.forEach((security: ISecurity) => {
        security.certificateExpiry = security.certificateExpiry != null ? moment(security.certificateExpiry) : null;
      });
    }
    return res;
  }
}

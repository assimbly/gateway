import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import dayjs from 'dayjs/esm';
import { DATE_FORMAT } from 'app/config/input.constants';
import { map } from 'rxjs/operators';

import { ApplicationConfigService } from 'app/core/config/application-config.service';

import { createRequestOption } from 'app/shared/util/request-util';
import { ICertificate } from 'app/shared/model/certificate.model';

type EntityResponseType = HttpResponse<ICertificate>;
type EntityArrayResponseType = HttpResponse<ICertificate[]>;

@Injectable({ providedIn: 'root' })
export class CertificateService {

  public resourceUrl = this.applicationConfigService.getEndpointFor('api/certificates');

  constructor(protected http: HttpClient, private applicationConfigService: ApplicationConfigService) {}

  create(certificate: ICertificate): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(certificate);
    return this.http
      .post<ICertificate>(this.resourceUrl, copy, { observe: 'response' })
      .pipe(map((res: EntityResponseType) => this.convertDateFromServer(res)));
  }

  update(certificate: ICertificate): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(certificate);
    return this.http
      .put<ICertificate>(this.resourceUrl, copy, { observe: 'response' })
      .pipe(map((res: EntityResponseType) => this.convertDateFromServer(res)));
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http
      .get<ICertificate>(`${this.resourceUrl}/${id}`, { observe: 'response' })
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
      .get<ICertificate[]>(this.resourceUrl, { params: options, observe: 'response' })
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

    return this.http.post(`${this.resourceUrl}/update`, url, { observe: 'response', responseType: 'text' });
  }

  uploadCertificate(keystoreName, certificate, fileType): Observable<HttpResponse<any>> {
    const options = new HttpHeaders({
      keystoreName,
      keystorePassword: 'supersecret',
      fileType,
    });
    return this.http.post(`${this.resourceUrl}/upload`, certificate, {
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

    return this.http.post(`${this.resourceUrl}/uploadp12`, certificate, {
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

    return this.http.get(`${this.resourceUrl}/generate`, {
      headers: options,
      observe: 'response',
      responseType: 'text',
    });
  }

  importCertificate(url, keystoreName, keystorePassword): Observable<HttpResponse<any>> {
    const options = new HttpHeaders({
      keystoreName,
      keystorePassword,
    });

    return this.http.post(`${this.resourceUrl}/import`, url, {
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

    return this.http.get(`${this.resourceUrl}/delete/${certificateName}`, {
      headers: options,
      observe: 'response',
      responseType: 'text',
    });
  }

  protected convertDateFromClient(certificate: ICertificate): ICertificate {
    const copy: ICertificate = Object.assign({}, certificate, {
      certificateExpiry:
        certificate.certificateExpiry != null && certificate.certificateExpiry.isValid() ? certificate.certificateExpiry.toJSON() : null,
    });
    return copy;
  }

  protected convertDateFromServer(res: EntityResponseType): EntityResponseType {
    if (res.body) {
      res.body.certificateExpiry = res.body.certificateExpiry != null ? dayjs(res.body.certificateExpiry) : null;
    }
    return res;
  }

  protected convertDateArrayFromServer(res: EntityArrayResponseType): EntityArrayResponseType {
    if (res.body) {
      res.body.forEach((certificate: ICertificate) => {
        certificate.certificateExpiry = certificate.certificateExpiry != null ? dayjs(certificate.certificateExpiry) : null;
      });
    }
    return res;
  }
}

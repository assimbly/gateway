import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpHeaders } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import dayjs from 'dayjs/esm';
import { DATE_FORMAT } from 'app/config/input.constants';
import { map } from 'rxjs/operators';
import { environment } from 'environments/environment';

import { serverApiUrl } from 'app/config';

import { createRequestOption } from 'app/shared/util/request-util';
import { ICertificate } from 'app/shared/model/certificate.model';

/** The keystores the runtime uses: trusted certificates for outbound TLS, and the server identity. */
export const TRUSTSTORE = 'outbound-truststore.p12';
export const IDENTITY_STORE = 'server-identity.p12';

/** Names (aliases) the runtime accepts for new certificates and identities. */
export const CERTIFICATE_NAME_PATTERN = '[a-z0-9]([a-z0-9._-]*[a-z0-9])?';

/** Turns a file name or common name into a certificate name: lowercase, other characters than a-z and 0-9 as hyphen. */
export function toCertificateName(value: string): string {
  return (value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

type EntityResponseType = HttpResponse<ICertificate>;
type EntityArrayResponseType = HttpResponse<ICertificate[]>;

@Injectable({ providedIn: 'root' })
export class CertificateService {

  /** The gateway's certificate records. */
  public resourceUrl = `${serverApiUrl}api/certificate-resources`;
  /** The runtime's keystores. */
  public keystoreUrl = `${serverApiUrl}api/certificates`;

  constructor(protected http: HttpClient) {}

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

  getCertificateDetails(certificateName: string): Observable<HttpResponse<string>> {
    return this.http.get(`${this.resourceUrl}/details/${certificateName}`, { observe: 'response', responseType: 'text' });
  }

  /** Saves a certificate record for every certificate in the response of a runtime import endpoint. */
  createFromRuntimeResponse(body: string, url: string): Observable<EntityResponseType[]> {
    const imported: any[] = JSON.parse(body).certificates.certificate;
    return forkJoin(
      imported.map(certificate =>
        this.create({
          url,
          certificateName: certificate.certificateName,
          certificateFile: certificate.certificateFile,
          certificateStore: certificate.certificateStore,
          certificateExpiry: dayjs(certificate.certificateExpiry),
        }),
      ),
    );
  }

  /** Imports CA certificates (PEM, or PEM/DER as base64 or data URL) as trusted certificates: name, name-2, ... */
  importTrustedCertificates(name: string, certificates: string): Observable<HttpResponse<string>> {
    const options = new HttpHeaders({
      'Content-Type': 'text/plain',
      keystoreName: TRUSTSTORE,
      keystorePassword: environment.KEYSTORE_PWD,
    });
    return this.http.post(`${this.keystoreUrl}/${encodeURIComponent(name)}`, certificates, {
      headers: options,
      observe: 'response',
      responseType: 'text',
    });
  }

  /** Imports a server identity: a PKCS12 file (private key + certificate chain) as base64 or data URL. */
  importIdentity(name: string, p12: string, password: string): Observable<HttpResponse<string>> {
    const options = new HttpHeaders({
      'Content-Type': 'text/plain',
      keystoreName: IDENTITY_STORE,
      keystorePassword: environment.KEYSTORE_PWD,
      password,
    });

    return this.http.post(`${this.keystoreUrl}/identity/${encodeURIComponent(name)}`, p12, {
      headers: options,
      observe: 'response',
      responseType: 'text',
    });
  }

  /** Generates a server identity with a self-signed certificate for the common name. */
  generateIdentity(cn: string): Observable<HttpResponse<string>> {
    const options = new HttpHeaders({
      keystoreName: IDENTITY_STORE,
      keystorePassword: environment.KEYSTORE_PWD,
      cn,
    });

    return this.http.post(`${this.keystoreUrl}/identity/generate`, null, {
      headers: options,
      observe: 'response',
      responseType: 'text',
    });
  }

  /** Downloads the certificates of a domain (host with optional port) into the truststore; 409 when it already has them. */
  addDomainCertificates(domain: string, certificateType = 'root'): Observable<HttpResponse<string>> {
    return this.http.post(this.domainUrl(domain), null, {
      headers: this.domainHeaders(certificateType),
      observe: 'response',
      responseType: 'text',
    });
  }

  /** Downloads the certificates of a domain again and replaces the stored ones; nothing changes when the download fails. */
  renewDomainCertificates(domain: string, certificateType = 'root'): Observable<HttpResponse<string>> {
    return this.http.put(this.domainUrl(domain), null, {
      headers: this.domainHeaders(certificateType),
      observe: 'response',
      responseType: 'text',
    });
  }

  /** Deletes the downloaded certificates of a domain from the truststore. */
  deleteDomainCertificates(domain: string): Observable<HttpResponse<string>> {
    return this.http.delete(this.domainUrl(domain), {
      headers: this.domainHeaders(),
      observe: 'response',
      responseType: 'text',
    });
  }

  private domainUrl(domain: string): string {
    return `${this.keystoreUrl}/domain/${encodeURIComponent(domain)}`;
  }

  private domainHeaders(certificateType?: string): HttpHeaders {
    const headers = new HttpHeaders({
      keystoreName: TRUSTSTORE,
      keystorePassword: environment.KEYSTORE_PWD,
    });
    return certificateType ? headers.set('certificateType', certificateType) : headers;
  }

  /** Deletes the certificate (or identity) from its keystore. */
  deleteCertificate(certificateName: string, certificateStore?: string): Observable<HttpResponse<string>> {
    // older records have no certificateStore; downloaded certificates live in the outbound truststore
    const keystoreName = certificateStore || TRUSTSTORE;
    const options = new HttpHeaders({
      keystoreName,
      keystorePassword: environment.KEYSTORE_PWD,
    });
    const path = keystoreName === IDENTITY_STORE ? 'identity/' : '';

    return this.http.delete(`${this.keystoreUrl}/${path}${encodeURIComponent(certificateName)}`, {
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

import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { CertificateService, IDENTITY_STORE, TRUSTSTORE } from './certificate.service';

describe('CertificateService keystore requests', () => {
  let service: CertificateService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(CertificateService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  // The runtime opens its keystores with its own password, so the browser never has to know it
  it.each([
    ['importing trusted certificates', () => service.importTrustedCertificates('my-ca', 'PEM'), TRUSTSTORE],
    ['importing an identity', () => service.importIdentity('my-id', 'P12', 'p12-password'), IDENTITY_STORE],
    ['generating an identity', () => service.generateIdentity('localhost'), IDENTITY_STORE],
    ['deleting a certificate', () => service.deleteCertificate('my-ca'), TRUSTSTORE],
    ['deleting an identity', () => service.deleteCertificate('my-id', IDENTITY_STORE), IDENTITY_STORE],
  ])('names the keystore but sends no keystore password when %s', (_, call, keystoreName) => {
    call().subscribe();

    const { request } = httpMock.expectOne(req => req.url.startsWith(service.keystoreUrl));
    expect(request.headers.get('keystoreName')).toBe(keystoreName);
    expect(request.headers.has('keystorePassword')).toBe(false);
  });

  it('sends the password of a PKCS12 file in the body, not as a header', () => {
    service.importIdentity('my-id', 'P12', 'p12-password').subscribe();

    const { request } = httpMock.expectOne(`${service.keystoreUrl}/identity/my-id`);
    expect(request.body).toEqual({ p12: 'P12', password: 'p12-password' });
    expect(request.headers.has('password')).toBe(false);
  });
});

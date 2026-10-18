import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { serverApiUrl } from 'app/config';
import { HANDLES_OWN_ERRORS } from 'app/core/interceptor/error-handler.interceptor';

import { FlowService } from './flow.service';
import { ScriptTrial } from './editor/script-flow';

describe('FlowService', () => {
  let service: FlowService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(FlowService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  describe('tryScript', () => {
    it("runs the script in the runtime's script validation and gives the new body", () => {
      let trial: ScriptTrial | undefined;
      service.tryScript('groovy', "'Hello ' + (body ?: 'world')", '').subscribe(result => (trial = result));

      const request = httpMock.expectOne({ method: 'POST', url: `${serverApiUrl}api/validation/script` });
      expect(request.request.body).toEqual({
        exchange: { headers: {}, properties: {}, body: null },
        script: { language: 'groovy', script: "'Hello ' + (body ?: 'world')" },
      });
      expect(request.request.context.get(HANDLES_OWN_ERRORS)).toBe(true);
      request.flush('{"exchange":{"body":"Hello world"},"result":"Hello world","code":1}');

      expect(trial).toEqual({ ok: true, body: 'Hello world' });
    });

    it("gives a broken script's error instead of failing", () => {
      let trial: ScriptTrial | undefined;
      service.tryScript('javascript', 'foo()', '').subscribe(result => (trial = result));

      httpMock
        .expectOne(`${serverApiUrl}api/validation/script`)
        .flush('{"message":"ReferenceError: foo is not defined"}', { status: 400, statusText: 'Bad Request' });

      expect(trial).toEqual({ ok: false, error: 'ReferenceError: foo is not defined' });
    });
  });
});

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

  describe('keeping why a Flow failed as an Alert', () => {
    const startUrl = `${serverApiUrl}api/integration/flow/7/start`;
    const alertsUrl = `${serverApiUrl}api/flows/7/alerts`;

    it('adds an Alert per failed Step, and only then gives the answer', () => {
      const answer = JSON.stringify({
        flow: { installed: { total: 2, failed: 1 }, steps: [{ id: 3, uri: 'file://in', status: 'error', message: 'Multiple consumers' }] },
      });
      let body: string | null | undefined;
      service.start(7).subscribe(response => (body = response.body));

      httpMock.expectOne(startUrl).flush(answer);
      const alerts = httpMock.expectOne({ method: 'POST', url: alertsUrl });
      expect(alerts.request.body).toEqual(['Failed to start [file://in]: Multiple consumers']);
      expect(body).toBeUndefined();
      alerts.flush(null, { status: 204, statusText: 'No Content' });

      expect(body).toBe(answer);
    });

    it('adds an Alert when the call fails, then still fails, also when the Alert could not be added', () => {
      let error: unknown;
      service.stop(7).subscribe({ error: err => (error = err) });

      httpMock.expectOne(`${serverApiUrl}api/integration/flow/7/stop`).flush('Runtime is busy', { status: 500, statusText: 'Server Error' });
      const alerts = httpMock.expectOne({ method: 'POST', url: alertsUrl });
      expect(alerts.request.body).toEqual(['Failed to stop: Runtime is busy']);
      alerts.flush(null, { status: 500, statusText: 'Server Error' });

      expect(error).toBeTruthy();
    });

    it('adds nothing when the Flow started', () => {
      let body: string | null | undefined;
      service.start(7).subscribe(response => (body = response.body));

      httpMock.expectOne(startUrl).flush('{"flow":{"event":"started"}}');

      expect(body).toBe('{"flow":{"event":"started"}}');
      httpMock.expectNone(alertsUrl);
    });
  });
});

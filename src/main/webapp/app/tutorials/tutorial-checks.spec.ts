import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';

import { firstValueFrom } from 'rxjs';

import { HANDLES_OWN_ERRORS } from 'app/core/interceptor/error-handler.interceptor';

import { TutorialChecks, parseCheck } from './tutorial-checks';

describe('TutorialChecks', () => {
  let checks: TutorialChecks;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()] });
    checks = TestBed.inject(TutorialChecks);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  /** Answers the lookup of the Flow by name: its id, or a 404 when there's no such Flow. */
  function flow(name: string, id?: number): void {
    const request = http.expectOne(req => req.url.endsWith('api/flows/byname') && req.params.get('name') === name);
    expect(request.request.context.get(HANDLES_OWN_ERRORS)).toBe(true);
    if (id === undefined) {
      request.flush('', { status: 404, statusText: 'Not Found' });
    } else {
      request.flush({ id, name });
    }
  }

  it('splits a check in its kind, its Flow and the rest', () => {
    expect(parseCheck('flowLog:DebugFlow:Cannot store file: out2')).toEqual({
      kind: 'flowLog',
      name: 'DebugFlow',
      value: 'Cannot store file: out2',
    });
  });

  it('passes flowExists when there is a Flow with the name', async () => {
    const present = firstValueFrom(checks.passes('flowExists:ExampleFlow'));
    flow('ExampleFlow', 7);
    expect(await present).toBe(true);

    const missing = firstValueFrom(checks.passes('flowExists:TestFlow'));
    flow('TestFlow');
    expect(await missing).toBe(false);
  });

  it('passes apiExists when there is an API with the name, in any case', async () => {
    const present = firstValueFrom(checks.passes('apiExists:Greetings'));
    const request = http.expectOne(req => req.url.endsWith('api/apis'));
    expect(request.request.context.get(HANDLES_OWN_ERRORS)).toBe(true);
    request.flush([{ id: 1, name: 'greetings' }]);
    expect(await present).toBe(true);

    const missing = firstValueFrom(checks.passes('apiExists:Greetings'));
    http.expectOne(req => req.url.endsWith('api/apis')).flush([]);
    expect(await missing).toBe(false);
  });

  it('passes flowStep when a saved Step has the text in its component or path', async () => {
    const steps = [
      { componentType: 'file', uri: 'C:/messages/in' },
      { componentType: 'setheader', uri: 'Content-Type' },
    ];
    const header = firstValueFrom(checks.passes('flowStep:Calculator:setheader'));
    http.expectOne(req => req.url.endsWith('api/flows/byname')).flush({ id: 5, name: 'Calculator', steps });
    expect(await header).toBe(true);

    const service = firstValueFrom(checks.passes('flowStep:Calculator:dneonline.com'));
    http.expectOne(req => req.url.endsWith('api/flows/byname')).flush({ id: 5, name: 'Calculator', steps });
    expect(await service).toBe(false);

    const missing = firstValueFrom(checks.passes('flowStep:Calculator:setheader'));
    flow('Calculator');
    expect(await missing).toBe(false);
  });

  it('passes flowStatus when the runtime reports that status', async () => {
    const started = firstValueFrom(checks.passes('flowStatus:ExampleFlow:started'));
    flow('ExampleFlow', 7);
    http.expectOne(req => req.url.endsWith('api/integration/flow/7/status')).flush('started');
    expect(await started).toBe(true);

    const stopped = firstValueFrom(checks.passes('flowStatus:ExampleFlow:stopped'));
    flow('ExampleFlow', 7);
    http.expectOne(req => req.url.endsWith('api/integration/flow/7/status')).flush('started');
    expect(await stopped).toBe(false);
  });

  it('passes a count check once the count is above the one the step started with', async () => {
    const baseline = firstValueFrom(checks.baseline('flowFailed:DebugFlow'));
    flow('DebugFlow');
    expect(await baseline).toBe(0);

    const failed = firstValueFrom(checks.passes('flowFailed:DebugFlow', 0));
    flow('DebugFlow', 9);
    http
      .expectOne(req => req.url.endsWith('api/integration/flow/9/transactions'))
      .flush({ flow: { total: 1, completed: 0, failed: 1, pending: 0 } });
    expect(await failed).toBe(true);
  });

  it('counts a Flow that never ran as 0', async () => {
    const completed = firstValueFrom(checks.baseline('flowCompleted:TestFlow'));
    flow('TestFlow', 3);
    http.expectOne(req => req.url.endsWith('api/integration/flow/3/transactions')).flush('', { status: 500, statusText: 'Error' });
    expect(await completed).toBe(0);
  });

  it('passes flowAlerts once the Flow has more alerts', async () => {
    const alerts = firstValueFrom(checks.passes('flowAlerts:DebugFlow', 0));
    flow('DebugFlow', 9);
    http.expectOne(req => req.url.endsWith('api/flows/9/alerts')).flush({ total: 2, messages: [] });
    expect(await alerts).toBe(true);
  });

  it("passes flowLog when the Flow's log contains the text", async () => {
    const logged = firstValueFrom(checks.passes('flowLog:ExampleFlow:Example flow running'));
    flow('ExampleFlow', 7);
    const request = http.expectOne(req => req.url.includes('api/logs/1/log/') && req.params.get('flowId') === '7');
    expect(request.request.context.get(HANDLES_OWN_ERRORS)).toBe(true);
    request.flush('2026-10-22 12:00:00 INFO [main] org.assimbly.runtime.7 : Exchange[Body: Example flow running]');
    expect(await logged).toBe(true);
  });

  /** Answers the lookup of the Gateway's broker and, when it has one, the queues on it. */
  function queues(list: { name: string; numberOfMessages: number }[]): void {
    http.expectOne(req => req.url.endsWith('api/brokers')).flush([{ id: 4, name: 'default', type: 'artemis' }]);
    const request = http.expectOne(req => req.url.endsWith('api/brokers/artemis/queues'));
    expect(request.request.context.get(HANDLES_OWN_ERRORS)).toBe(true);
    request.flush({ queues: { queue: list } });
  }

  it('passes brokerStatus when the broker reports that status', async () => {
    const stopped = firstValueFrom(checks.passes('brokerStatus:stopped'));
    http.expectOne(req => req.url.endsWith('api/brokers')).flush([{ id: 4, name: 'default', type: 'artemis' }]);
    http.expectOne(req => req.url.endsWith('api/brokers/4/status') && req.params.get('brokerType') === 'artemis').flush('stopped');
    expect(await stopped).toBe(true);

    const noBroker = firstValueFrom(checks.passes('brokerStatus:stopped'));
    http.expectOne(req => req.url.endsWith('api/brokers')).flush([]);
    expect(await noBroker).toBe(false);
  });

  it('passes queueExists when the broker has the queue', async () => {
    const present = firstValueFrom(checks.passes('queueExists:HelloQueue'));
    queues([
      { name: 'DLQ', numberOfMessages: 0 },
      { name: 'HelloQueue', numberOfMessages: 0 },
    ]);
    expect(await present).toBe(true);

    const missing = firstValueFrom(checks.passes('queueExists:HelloQueue'));
    queues([{ name: 'DLQ', numberOfMessages: 0 }]);
    expect(await missing).toBe(false);
  });

  it('passes queueMessages once the queue has more messages than when the step opened', async () => {
    const baseline = firstValueFrom(checks.baseline('queueMessages:HelloQueue'));
    queues([{ name: 'HelloQueue', numberOfMessages: 2 }]);
    expect(await baseline).toBe(2);

    const same = firstValueFrom(checks.passes('queueMessages:HelloQueue', 2));
    queues([{ name: 'HelloQueue', numberOfMessages: 2 }]);
    expect(await same).toBe(false);

    const more = firstValueFrom(checks.passes('queueMessages:HelloQueue', 2));
    queues([{ name: 'HelloQueue', numberOfMessages: 3 }]);
    expect(await more).toBe(true);
  });

  it('passes route when the address of the page contains the text', async () => {
    jest.spyOn(TestBed.inject(Router), 'url', 'get').mockReturnValue('/flow/editor/7?mode=clone');
    expect(await firstValueFrom(checks.passes('route:mode=clone'))).toBe(true);
    expect(await firstValueFrom(checks.passes('route:mode=edit'))).toBe(false);
  });

  it('never passes a check it does not know', async () => {
    expect(await firstValueFrom(checks.passes('somethingElse:ExampleFlow'))).toBe(false);
  });
});

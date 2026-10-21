import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { Observable, of } from 'rxjs';

import { AlertService } from 'app/core/util/alert.service';
import { EventManager } from 'app/core/util/event-manager.service';

import { TutorialChecks } from './tutorial-checks';
import { CHECK_INTERVAL, TutorialService } from './tutorial.service';

const MARKDOWN = `# Quick start

<!-- tutorial: {"id":"quick-start","title":"Quick start","minutes":10,"fixtures":{"ExampleFlow":"ExampleFlow.xml"}} -->

Welcome.

## Open it

Click it.

## Start it

<!-- step: {"check":"flowStatus:ExampleFlow:started"} -->

Click Start.
`;

describe('TutorialService', () => {
  let service: TutorialService;
  let http: HttpTestingController;
  let started: boolean;
  let exists: boolean;
  let checks: { baseline: jest.Mock; passes: jest.Mock };

  beforeEach(() => {
    localStorage.clear();
    jest.useFakeTimers();
    started = false;
    exists = true;
    checks = {
      baseline: jest.fn(() => of(0)),
      passes: jest.fn((check: string): Observable<boolean> => of(check.startsWith('flowExists') ? exists : started)),
    };
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: TutorialChecks, useValue: checks },
        { provide: AlertService, useValue: { addAlert: jest.fn() } },
      ],
    });
    service = TestBed.inject(TutorialService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    service.stopWatching();
    http.verify();
    jest.useRealTimers();
  });

  function start(): void {
    service.start('quick-start');
    http.expectOne('content/tutorials/quick-start/README.md').flush(MARKDOWN);
  }

  function stored(): any {
    return JSON.parse(localStorage.getItem(TutorialService.STORAGE_KEY)!);
  }

  it('lists the tutorials and reopens the one the user was following', () => {
    localStorage.setItem(
      TutorialService.STORAGE_KEY,
      JSON.stringify({ active: 'quick-start', tutorials: { 'quick-start': { step: 1, done: [0] } } }),
    );
    service = TestBed.runInInjectionContext(() => new TutorialService());

    service.load();
    http.expectOne('content/tutorials/index.json').flush([{ id: 'quick-start', title: 'Quick start', minutes: 10, fixtures: {} }]);
    http.expectOne('content/tutorials/quick-start/README.md').flush(MARKDOWN);

    expect(service.summaries().map(summary => summary.id)).toEqual(['quick-start']);
    expect(service.step()?.title).toBe('Open it');
    expect(service.done().has(0)).toBe(true);
  });

  it('says when the tutorials cannot be loaded', () => {
    service.load();
    http.expectOne('content/tutorials/index.json').flush('', { status: 404, statusText: 'Not Found' });
    expect(service.error()).toBeTruthy();
  });

  it('counts a step without a check as done once the user moves on, and remembers where they are', () => {
    start();
    service.next();
    service.next();

    expect(service.step()?.title).toBe('Start it');
    expect([...service.done()]).toEqual([0, 1]);
    expect(stored()).toEqual({ active: 'quick-start', tutorials: { 'quick-start': { step: 2, done: [0, 1] } } });
  });

  it('ticks a step off once its check passes, and then stops asking', () => {
    start();
    service.go(2);
    expect(service.checking()).toBe(true);

    jest.advanceTimersByTime(CHECK_INTERVAL * 2);
    expect(service.stepDone()).toBe(false);

    started = true;
    jest.advanceTimersByTime(CHECK_INTERVAL);
    expect(service.stepDone()).toBe(true);
    expect(service.checking()).toBe(false);

    const calls = checks.passes.mock.calls.length;
    jest.advanceTimersByTime(CHECK_INTERVAL * 3);
    expect(checks.passes.mock.calls.length).toBe(calls);
  });

  it('marks the tutorial finished after its last step', () => {
    start();
    service.go(2);
    service.next();

    expect(service.tutorial()).toBeUndefined();
    expect(service.isFinished('quick-start')).toBe(true);
  });

  it('offers to add a Flow the tutorial starts from when the Gateway does not have it', () => {
    exists = false;
    const broadcast = jest.spyOn(TestBed.inject(EventManager), 'broadcast');
    start();
    expect(service.missingFixtures()).toEqual(['ExampleFlow']);

    service.addFixture('ExampleFlow');
    http.expectOne('content/tutorials/quick-start/ExampleFlow.xml').flush('<dil></dil>');
    const imported = http.expectOne(req => req.url.endsWith('api/import/flow'));
    expect(imported.request.body).toBe('<dil></dil>');
    expect(imported.request.params.get('onConflict')).toBe('replace');
    imported.flush({ flowId: 7, name: 'ExampleFlow', type: 'flow', replaced: false, warnings: [] });

    expect(service.missingFixtures()).toEqual([]);
    expect(broadcast).toHaveBeenCalledWith(expect.objectContaining({ name: 'flowListModification' }));
  });
});

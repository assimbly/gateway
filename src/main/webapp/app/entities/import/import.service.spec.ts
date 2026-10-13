import { Component } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';

import { provideTranslateService } from '@ngx-translate/core';

import { AlertService } from 'app/core/util/alert.service';
import { EventManager } from 'app/core/util/event-manager.service';

import { IFlowImportResult, editorOf } from './import.model';
import { ImportService } from './import.service';

@Component({ template: '' })
class EditorStub {}

function result(overrides: Partial<IFlowImportResult> = {}): IFlowImportResult {
  return { flowId: 42, name: 'Orders', type: 'flow', replaced: false, warnings: [], ...overrides };
}

describe('Import service', () => {
  let service: ImportService;
  let http: HttpTestingController;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: 'flow/editor/:id', component: EditorStub }]),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideTranslateService(),
      ],
    });
    service = TestBed.inject(ImportService);
    http = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
  });

  afterEach(() => http.verify());

  it('posts a DIL export as XML, with what to do when the name is taken', () => {
    service.importFlow('<dil/>', 'rename').subscribe();

    const request = http.expectOne(req => req.url === 'api/import/flow');
    expect(request.request.method).toBe('POST');
    expect(request.request.params.get('onConflict')).toBe('rename');
    expect(request.request.headers.get('Content-Type')).toBe('application/xml');
    expect(request.request.body).toBe('<dil/>');
    request.flush(result());
  });

  it('posts Camel XML with the name of the Flow when there is one', () => {
    service.importCamel('<route/>', '  Timer  ').subscribe();

    const request = http.expectOne(req => req.url === 'api/import/camel');
    expect(request.request.params.get('name')).toBe('Timer');
    expect(request.request.headers.get('Content-Type')).toBe('application/xml');
    request.flush(result({ type: 'route' }));
  });

  it('leaves the name out when it is blank', () => {
    service.importCamel('<route/>', '  ').subscribe();

    const request = http.expectOne(req => req.url === 'api/import/camel');
    expect(request.request.params.has('name')).toBe(false);
    request.flush(result({ type: 'route' }));
  });

  it('posts a script as plain text with its language', () => {
    service.importScript('println 1', 'groovy', 'Hello').subscribe();

    const request = http.expectOne(req => req.url === 'api/import/script');
    expect(request.request.params.get('language')).toBe('groovy');
    expect(request.request.params.get('name')).toBe('Hello');
    expect(request.request.headers.get('Content-Type')).toBe('text/plain');
    expect(request.request.body).toBe('println 1');
    request.flush(result({ type: 'script' }));
  });

  it.each([
    ['script', 'script'],
    ['route', 'route'],
    ['flow', 'flow'],
    ['esb', 'flow'],
    ['connector', 'flow'],
    [undefined, 'flow'],
  ])('opens a Flow of type %s in the %s editor', (type, editor) => {
    expect(editorOf(type)).toBe(editor);
  });

  it('opens the imported Flow in its editor, and says so', async () => {
    const alerts = TestBed.inject(AlertService);
    const broadcast = jest.spyOn(TestBed.inject(EventManager), 'broadcast');

    await service.open(result({ flowId: 7, name: 'Nightly', type: 'script' }));

    const url = router.parseUrl(router.url);
    expect(url.root.children['primary'].segments.map(s => s.path)).toEqual(['flow', 'editor', '7']);
    expect(url.queryParams).toEqual({ mode: 'edit', editor: 'script', id: '7' });
    expect(alerts.get().map(alert => alert.message)).toEqual(['Imported Flow Nightly']);
    expect(broadcast).toHaveBeenCalledWith(expect.objectContaining({ name: 'flowListModification' }));
  });

  it('says a Flow was replaced, and shows the warnings', async () => {
    const alerts = TestBed.inject(AlertService);

    await service.open(result({ replaced: true, warnings: ['Not imported: <rest>.'] }));

    expect(alerts.get().map(alert => [alert.type, alert.message])).toEqual([
      ['success', 'Replaced Flow Orders'],
      ['warning', 'Not imported: &lt;rest&gt;.'],
    ]);
  });

  it('shows a name with markup in it as text', async () => {
    const alerts = TestBed.inject(AlertService);

    await service.open(result({ name: 'a <b> & c' }));

    expect(alerts.get().map(alert => alert.message)).toEqual(['Imported Flow a &lt;b&gt; &amp; c']);
  });
});

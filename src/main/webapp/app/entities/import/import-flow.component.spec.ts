import { Component } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';

import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { provideTranslateService } from '@ngx-translate/core';

import { fontAwesomeIcons } from 'app/config/font-awesome-icons';
import { AlertService } from 'app/core/util/alert.service';

import { ImportFlowComponent } from './import-flow.component';
import { IFlowImportResult } from './import.model';

@Component({ template: '' })
class EditorStub {}

const flowExport = `<?xml version="1.0" encoding="UTF-8"?>
<dil>
  <integrations>
    <integration>
      <id>1</id>
      <flows>
        <flow>
          <id>12</id>
          <name>Orders to SFTP</name>
          <type>flow</type>
        </flow>
      </flows>
    </integration>
  </integrations>
  <core/>
</dil>`;

const imported: IFlowImportResult = { flowId: 31, name: 'Orders to SFTP', type: 'flow', replaced: false, warnings: [] };

describe('Import a Flow (DIL)', () => {
  let fixture: ComponentFixture<ImportFlowComponent>;
  let page: ImportFlowComponent;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: 'flow/editor/:id', component: EditorStub },
          { path: 'import', component: EditorStub },
        ]),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideTranslateService(),
      ],
    });
    TestBed.inject(FaIconLibrary).addIcons(...fontAwesomeIcons);
    fixture = TestBed.createComponent(ImportFlowComponent);
    page = fixture.componentInstance;
    fixture.detectChanges();
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('can not import before there is something to import', () => {
    expect(importButton().disabled).toBe(true);

    page.text.set(flowExport);
    fixture.detectChanges();

    expect(importButton().disabled).toBe(false);
  });

  it('imports a Flow that is new, then opens it in the visual editor', async () => {
    page.text.set(flowExport);
    page.fileName.set('export_flow_Orders.xml');

    page.start();
    lookUpExistingFlow().flush(null, { status: 404, statusText: 'Not Found' });
    const request = http.expectOne(req => req.url === 'api/import/flow');
    expect(request.request.params.get('onConflict')).toBe('replace');
    expect(request.request.body).toBe(flowExport);
    request.flush(imported);
    await fixture.whenStable();

    const router = TestBed.inject(Router);
    const url = router.parseUrl(router.url);
    expect(url.root.children['primary'].segments.map(s => s.path)).toEqual(['flow', 'editor', '31']);
    expect(url.queryParams).toEqual({ mode: 'edit', editor: 'flow', id: '31' });
    expect(TestBed.inject(AlertService).get().map(alert => alert.message)).toEqual(['Imported Flow Orders to SFTP']);
  });

  it('imports a Flow exported as JSON, sending it as JSON', () => {
    const flowJson = '{"dil":{"integrations":{"integration":{"flows":{"flow":{"id":"12","name":"Orders to SFTP"}}}}}}';
    page.text.set(flowJson);
    page.fileName.set('export_flow_Orders.json');

    page.start();
    lookUpExistingFlow().flush(null, { status: 404, statusText: 'Not Found' });
    const request = http.expectOne(req => req.url === 'api/import/flow');
    expect(request.request.headers.get('Content-Type')).toBe('application/json');
    expect(request.request.body).toBe(flowJson);
    request.flush(imported);
  });

  it('sends a Flow exported as XML as XML', () => {
    page.text.set(flowExport);

    page.start();
    lookUpExistingFlow().flush(null, { status: 404, statusText: 'Not Found' });
    const request = http.expectOne(req => req.url === 'api/import/flow');
    expect(request.request.headers.get('Content-Type')).toBe('application/xml');
    request.flush(imported);
  });

  it('asks before replacing a Flow with the same name, and replaces it once confirmed', () => {
    page.text.set(flowExport);

    page.start();
    lookUpExistingFlow().flush({ id: 3, name: 'Orders to SFTP' });
    fixture.detectChanges();

    http.expectNone(req => req.url === 'api/import/flow');
    expect(fixture.nativeElement.textContent).toContain('A Flow named Orders to SFTP already exists');
    expect(importButton().disabled).toBe(true);

    button('Replace Orders to SFTP').click();

    const request = http.expectOne(req => req.url === 'api/import/flow');
    expect(request.request.params.get('onConflict')).toBe('replace');
    request.flush({ ...imported, replaced: true });
  });

  it('imports it as a new Flow when asked to keep the existing one', () => {
    page.text.set(flowExport);

    page.start();
    lookUpExistingFlow().flush({ id: 3, name: 'Orders to SFTP' });
    fixture.detectChanges();

    button('Import as a new Flow').click();

    const request = http.expectOne(req => req.url === 'api/import/flow');
    expect(request.request.params.get('onConflict')).toBe('rename');
    request.flush({ ...imported, name: 'Orders to SFTP-2' });
  });

  it('sends nothing when the replacing is cancelled', () => {
    page.text.set(flowExport);

    page.start();
    lookUpExistingFlow().flush({ id: 3, name: 'Orders to SFTP' });
    fixture.detectChanges();

    button('Cancel').click();
    fixture.detectChanges();

    http.expectNone(req => req.url === 'api/import/flow');
    expect(fixture.nativeElement.textContent).not.toContain('already exists');
    expect(importButton().disabled).toBe(false);
  });

  it.each([
    ['text that is not XML or JSON', 'hello', "isn't an XML or JSON file"],
    ['JSON that is cut off', '{"dil": ', "isn't valid JSON"],
    ['a file without a Flow', '<dil><integrations/></dil>', "doesn't contain a Flow"],
    ['a Flow that has no name', flowExport.replace('<name>Orders to SFTP</name>', ''), "doesn't contain a Flow"],
  ])('refuses %s, without sending it', (_, text, reason) => {
    page.text.set(text);
    page.fileName.set('notes.xml');

    page.start();
    fixture.detectChanges();

    http.expectNone(req => req.url === 'api/import/flow');
    http.expectNone(req => req.url === 'api/flows/byname');
    expect(fixture.nativeElement.textContent).toContain(`notes.xml ${reason}`);
  });

  it('says why the Gateway refused the file', () => {
    page.text.set(flowExport);
    page.fileName.set('export.xml');

    page.start();
    lookUpExistingFlow().flush(null, { status: 404, statusText: 'Not Found' });
    http
      .expectOne(req => req.url === 'api/import/flow')
      .flush({ detail: 'The file contains 2 Flows. Import it as a Gateway backup instead.' }, { status: 400, statusText: 'Bad Request' });
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain("Couldn't import export.xml: The file contains 2 Flows.");
    expect(importButton().disabled).toBe(false);
  });

  function lookUpExistingFlow() {
    return http.expectOne(req => req.url === 'api/flows/byname' && req.params.get('name') === 'Orders to SFTP');
  }

  function importButton(): HTMLButtonElement {
    return button('Import') as HTMLButtonElement;
  }

  function button(name: string): HTMLButtonElement {
    const buttons: HTMLButtonElement[] = Array.from(fixture.nativeElement.querySelectorAll('button'));
    const found = buttons.find(element => element.textContent?.trim() === name);
    if (!found) {
      throw new Error(`No button named ${name}`);
    }
    return found;
  }
});

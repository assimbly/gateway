import { Component } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';

import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { provideTranslateService } from '@ngx-translate/core';

import { fontAwesomeIcons } from 'app/config/font-awesome-icons';
import { EventManager } from 'app/core/util/event-manager.service';

import { NewFlowDialogComponent } from './new-flow-dialog.component';

@Component({ template: '' })
class EditorStub {}

const flowExport = `<?xml version="1.0" encoding="UTF-8"?>
<dil>
  <version>6.0.0</version>
  <integrations>
    <integration>
      <id>1</id>
      <name>default</name>
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

describe('New Flow dialog', () => {
  let fixture: ComponentFixture<NewFlowDialogComponent>;
  let dialog: NewFlowDialogComponent;
  let activeModal: { close: jest.Mock; dismiss: jest.Mock };
  let http: HttpTestingController;
  let eventManager: EventManager;

  beforeEach(() => {
    activeModal = { close: jest.fn(), dismiss: jest.fn() };
    TestBed.configureTestingModule({
      imports: [NewFlowDialogComponent],
      providers: [
        provideRouter([
          { path: 'flow/editor', component: EditorStub },
          { path: 'rest-apis/new', component: EditorStub },
        ]),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideTranslateService(),
        { provide: NgbActiveModal, useValue: activeModal },
      ],
    });
    TestBed.inject(FaIconLibrary).addIcons(...fontAwesomeIcons);
    fixture = TestBed.createComponent(NewFlowDialogComponent);
    dialog = fixture.componentInstance;
    dialog.integrationId = 7;
    fixture.detectChanges();
    http = TestBed.inject(HttpTestingController);
    eventManager = TestBed.inject(EventManager);
  });

  afterEach(() => http.verify());

  it.each([
    ['Visual', 'flow'],
    ['Script', 'script'],
    ['Camel route', 'route'],
  ])('opens the %s editor for a new Flow', async (choice, editor) => {
    choiceNamed(choice).click();
    await fixture.whenStable();

    const url = TestBed.inject(Router).parseUrl(TestBed.inject(Router).url);
    expect(url.root.children['primary'].segments.map(s => s.path)).toEqual(['flow', 'editor']);
    expect(url.queryParams).toEqual({ mode: 'edit', editor });
    expect(activeModal.close).toHaveBeenCalled();
  });

  it('opens the API designer for a new API', async () => {
    choiceNamed('API').click();
    await fixture.whenStable();

    const url = TestBed.inject(Router).parseUrl(TestBed.inject(Router).url);
    expect(url.root.children['primary'].segments.map(s => s.path)).toEqual(['rest-apis', 'new']);
    expect(activeModal.close).toHaveBeenCalled();
  });

  it('offers Visual, Camel route (low code), Script (code) and API, in that order', () => {
    const titles = Array.from<HTMLElement>(fixture.nativeElement.querySelectorAll('.flow-type-choice__title')).map(e => e.textContent?.trim());
    const levels = Array.from<HTMLElement>(fixture.nativeElement.querySelectorAll('.flow-type-choice__level')).map(e => e.textContent?.trim());

    expect(titles.slice(0, 4)).toEqual(['Visual', 'Camel route', 'Script', 'API']);
    expect(levels.slice(1, 4)).toEqual(['Low code', 'Code', 'Design']);
  });

  it('imports a Flow export into the Flow it contains, then refreshes the list', async () => {
    const broadcast = jest.spyOn(eventManager, 'broadcast');

    await dialog.importFile(new File([flowExport], 'export_flow_Orders to SFTP_20261004.xml'));
    lookUpExistingFlow().flush(null, { status: 404, statusText: 'Not Found' });

    const request = http.expectOne({ method: 'POST', url: 'api/environment/7/flow/12' });
    expect(request.request.body).toBe(flowExport);
    request.flush('Flow configuration set');

    expect(activeModal.close).toHaveBeenCalled();
    expect(broadcast).toHaveBeenCalledWith(expect.objectContaining({ name: 'flowListModification' }));
  });

  it('asks before replacing a Flow with the same name, and replaces it once confirmed', async () => {
    await dialog.importFile(new File([flowExport], 'export.xml'));
    lookUpExistingFlow().flush({ id: 3, name: 'Orders to SFTP' });
    fixture.detectChanges();

    http.expectNone('api/environment/7/flow/12');
    expect(fixture.nativeElement.textContent).toContain('A Flow named Orders to SFTP already exists');

    buttonNamed('Replace Orders to SFTP').click();

    http.expectOne({ method: 'POST', url: 'api/environment/7/flow/12' }).flush('Flow configuration set');
    expect(activeModal.close).toHaveBeenCalled();
  });

  it('leaves the existing Flow alone when replacing it is cancelled', async () => {
    await dialog.importFile(new File([flowExport], 'export.xml'));
    lookUpExistingFlow().flush({ id: 3, name: 'Orders to SFTP' });
    fixture.detectChanges();

    buttonNamed('Keep the existing Flow').click();
    fixture.detectChanges();

    http.expectNone('api/environment/7/flow/12');
    expect(activeModal.close).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).not.toContain('already exists');
  });

  it.each([
    ['without a Flow', '<dil><integrations/></dil>'],
    ['with a Flow that has no name', flowExport.replace('<name>Orders to SFTP</name>', '')],
  ])('refuses a file %s, without sending it', async (_, xml) => {
    await dialog.importFile(new File([xml], 'notes.xml'));
    fixture.detectChanges();

    http.expectNone('api/environment/7/flow/12');
    expect(activeModal.close).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain("doesn't contain a Flow");
  });

  it('stays open and says why when the Gateway rejects the import', async () => {
    await dialog.importFile(new File([flowExport], 'export.xml'));
    lookUpExistingFlow().flush(null, { status: 404, statusText: 'Not Found' });

    http
      .expectOne('api/environment/7/flow/12')
      .flush('<response><message>Invalid step</message></response>', { status: 400, statusText: 'Bad Request' });
    fixture.detectChanges();

    expect(activeModal.close).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain("Couldn't import export.xml");
  });

  function lookUpExistingFlow() {
    return http.expectOne(request => request.url === 'api/flows/byname' && request.params.get('name') === 'Orders to SFTP');
  }

  function buttonNamed(name: string): HTMLElement {
    const buttons: HTMLElement[] = Array.from(fixture.nativeElement.querySelectorAll('button'));
    const button = buttons.find(element => element.textContent?.trim() === name);
    if (!button) {
      throw new Error(`No button named ${name}`);
    }
    return button;
  }

  function choiceNamed(name: string): HTMLElement {
    const choices: HTMLElement[] = Array.from(fixture.nativeElement.querySelectorAll('a, button'));
    const choice = choices.find(element => element.querySelector('.flow-type-choice__title')?.textContent?.trim() === name);
    if (!choice) {
      throw new Error(`No choice named ${name}`);
    }
    return choice;
  }
});

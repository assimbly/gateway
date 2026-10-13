import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { provideTranslateService } from '@ngx-translate/core';

import { fontAwesomeIcons } from 'app/config/font-awesome-icons';
import { AlertService } from 'app/core/util/alert.service';
import { EventManager } from 'app/core/util/event-manager.service';

import { IntegrationImportDialogComponent } from './integration-import-dialog.component';

const backup = '<dil><integrations><integration><id>1</id></integration></integrations><core/></dil>';

describe('Import Gateway backup dialog', () => {
  let fixture: ComponentFixture<IntegrationImportDialogComponent>;
  let dialog: IntegrationImportDialogComponent;
  let activeModal: { close: jest.Mock; dismiss: jest.Mock };
  let http: HttpTestingController;

  beforeEach(() => {
    activeModal = { close: jest.fn(), dismiss: jest.fn() };
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideTranslateService(), { provide: NgbActiveModal, useValue: activeModal }],
    });
    TestBed.inject(FaIconLibrary).addIcons(...fontAwesomeIcons);
    fixture = TestBed.createComponent(IntegrationImportDialogComponent);
    dialog = fixture.componentInstance;
    fixture.detectChanges();
    http = TestBed.inject(HttpTestingController);
    http.expectOne('api/integrations').flush([
      { id: 7, name: 'default' },
      { id: 9, name: 'other' },
    ]);
    fixture.detectChanges();
  });

  afterEach(() => http.verify());

  it('selects the first integration', () => {
    expect(dialog.integrationId).toBe(7);
    expect(importButton().disabled).toBe(true);
  });

  it('posts the file to the chosen integration, then closes and refreshes', async () => {
    const broadcast = jest.spyOn(TestBed.inject(EventManager), 'broadcast');
    dialog.integrationId = 9;
    await chooseFile(new File([backup], 'backup.xml'));

    dialog.importConfiguration();

    const request = http.expectOne('api/environment/9');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toBe(backup);
    expect(request.request.headers.get('Content-Type')).toBe('application/xml');
    request.flush({ status: 200, message: 'Gateway configuration set' });

    expect(activeModal.close).toHaveBeenCalledWith(true);
    expect(broadcast).toHaveBeenCalledWith(expect.objectContaining({ name: 'integrationListModification' }));
    expect(broadcast).toHaveBeenCalledWith(expect.objectContaining({ name: 'flowListModification' }));
    expect(TestBed.inject(AlertService).get().map(alert => alert.message)).toEqual(['Imported backup.xml']);
  });

  it('stays open and says why the Gateway refused the file', async () => {
    await chooseFile(new File([backup], 'backup.xml'));

    dialog.importConfiguration();
    http.expectOne('api/environment/7').flush({ status: 400, message: 'Unexpected element' }, { status: 400, statusText: 'Bad Request' });
    fixture.detectChanges();

    expect(activeModal.close).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain("Couldn't import backup.xml: Unexpected element");
    expect(importButton().disabled).toBe(false);
  });

  it('does nothing without an integration', async () => {
    await chooseFile(new File([backup], 'backup.xml'));
    dialog.integrationId = undefined;

    dialog.importConfiguration();

    http.expectNone(req => req.url.startsWith('api/environment'));
  });

  async function chooseFile(file: File): Promise<void> {
    const input = document.createElement('input');
    Object.defineProperty(input, 'files', { value: [file] });
    await dialog.openFile({ target: input } as unknown as Event);
    fixture.detectChanges();
  }

  function importButton(): HTMLButtonElement {
    const buttons: HTMLButtonElement[] = Array.from(fixture.nativeElement.querySelectorAll('button'));
    return buttons.find(button => button.textContent?.includes('Import')) as HTMLButtonElement;
  }
});

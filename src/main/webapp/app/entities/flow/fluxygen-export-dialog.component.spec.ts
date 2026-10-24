import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { saveAs } from 'file-saver/FileSaver';

import { fontAwesomeIcons } from 'app/config/font-awesome-icons';
import { IFlow } from 'app/shared/model/flow.model';

import { FluxygenExportDialogComponent, fluxygenExportProblem } from './fluxygen-export-dialog.component';
import { attachmentName } from './flow.service';

jest.mock('file-saver/FileSaver', () => ({ saveAs: jest.fn() }));

const PASSPHRASE = 'correct horse battery';

const FLOWS: IFlow[] = [
  { id: 3, name: 'Orders in', type: 'flow', steps: [] },
  { id: 5, name: 'Invoice script', type: 'script', steps: [] },
  { id: 8, name: 'Camel route', type: 'route', steps: [] },
];

describe('Export for Fluxygen dialog', () => {
  let fixture: ComponentFixture<FluxygenExportDialogComponent>;
  let http: HttpTestingController;
  let activeModal: { close: jest.Mock; dismiss: jest.Mock };

  beforeEach(async () => {
    (saveAs as jest.Mock).mockClear();
    activeModal = { close: jest.fn(), dismiss: jest.fn() };
    TestBed.configureTestingModule({
      imports: [FluxygenExportDialogComponent],
      providers: [provideRouter([{ path: 'fluxygen', children: [] }]), provideHttpClient(), provideHttpClientTesting(), { provide: NgbActiveModal, useValue: activeModal }],
    });
    TestBed.inject(FaIconLibrary).addIcons(...fontAwesomeIcons);
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(FluxygenExportDialogComponent);
    fixture.componentInstance.integrationId.set(7);
    fixture.componentInstance.load();
    http.expectOne(request => request.url === 'api/flows/byintegrationid/7').flush(FLOWS);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  afterEach(() => http.verify());

  function element<T extends HTMLElement>(selector: string): T {
    return fixture.nativeElement.querySelector(selector);
  }

  async function type(selector: string, value: string): Promise<void> {
    const input = element<HTMLInputElement>(selector);
    input.value = value;
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    await fixture.whenStable();
  }

  function flowCheckbox(id: number): HTMLInputElement {
    return element<HTMLInputElement>(`#fluxygen-export-flow-${id}`);
  }

  function submit(): void {
    element<HTMLButtonElement>('button[type=submit]').click();
    fixture.detectChanges();
  }

  /** Waits for an element that appears once an answer was read. */
  async function shown(selector: string): Promise<void> {
    for (let i = 0; i < 50 && !element(selector); i++) {
      await new Promise(resolve => setTimeout(resolve, 10));
      fixture.detectChanges();
    }
  }

  function problem(): string | undefined {
    return element('.fluxygen-export__problem')?.textContent?.trim();
  }

  it('lists every Flow, all chosen, and marks the unfinished Visual Flow as a Draft', () => {
    const labels = Array.from<HTMLElement>(fixture.nativeElement.querySelectorAll('.fluxygen-export__flows label'));

    expect(labels.map(label => label.textContent?.replace('Draft', '').replace(/\s+/g, ' ').trim())).toEqual([
      'Orders in · Visual',
      'Invoice script · Script',
      'Camel route · Camel route',
    ]);
    expect(labels.map(label => !!label.querySelector('.fluxygen-export__draft'))).toEqual([true, false, false]);
    expect(FLOWS.every(flow => flowCheckbox(flow.id!).checked)).toBe(true);
    expect(element<HTMLInputElement>('#fluxygen-export-all').checked).toBe(true);
  });

  it('says what is and isn\'t included, the groupless group and that Fluxygen asks for the passphrase', () => {
    const text = fixture.nativeElement.textContent.replace(/\s+/g, ' ');

    expect(text).toContain('groupless');
    expect(text).toContain('@{key}');
    expect(text).toContain('Not included: Brokers, Queues and Topics, Certificates and users');
    expect(text).toContain('Fluxygen asks for it when you import the zip');
  });

  it('introduces Fluxygen and closes when the user opens What is Fluxygen?', () => {
    const link = element<HTMLAnchorElement>('.fluxygen-export__intro a');

    expect(element('.fluxygen-export__intro').textContent).toContain('managed platform built on Assimbly');
    expect(link.textContent?.trim()).toBe('What is Fluxygen?');
    expect(link.getAttribute('href')).toBe('/fluxygen');

    link.click();

    expect(activeModal.dismiss).toHaveBeenCalled();
  });

  it('refuses a passphrase shorter than 12 characters', async () => {
    await type('#fluxygen-export-passphrase', 'elevenchars');
    await type('#fluxygen-export-confirmation', 'elevenchars');

    submit();

    expect(problem()).toBe('The passphrase needs at least 12 characters.');
    http.expectNone(request => request.url.endsWith('fluxygen-export'));
  });

  it('refuses a confirmation that differs', async () => {
    await type('#fluxygen-export-passphrase', PASSPHRASE);
    await type('#fluxygen-export-confirmation', PASSPHRASE + '!');

    submit();

    expect(problem()).toBe("The passphrases don't match.");
    http.expectNone(request => request.url.endsWith('fluxygen-export'));
  });

  it('refuses to export no Flow at all', async () => {
    element<HTMLInputElement>('#fluxygen-export-all').click();
    fixture.detectChanges();
    await type('#fluxygen-export-passphrase', PASSPHRASE);
    await type('#fluxygen-export-confirmation', PASSPHRASE);

    submit();

    expect(problem()).toBe('Choose at least one Flow.');
    http.expectNone(request => request.url.endsWith('fluxygen-export'));
  });

  it('posts the chosen Flows and the passphrase, saves the zip under its own name and forgets the passphrase', async () => {
    flowCheckbox(5).click();
    fixture.detectChanges();
    await type('#fluxygen-export-passphrase', PASSPHRASE);
    await type('#fluxygen-export-confirmation', PASSPHRASE);

    submit();

    const request = http.expectOne('api/environment/7/fluxygen-export');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ flowIds: [3, 8], passphrase: PASSPHRASE });
    expect(request.request.urlWithParams).not.toContain(PASSPHRASE);
    request.flush(new Blob(['zip']), {
      headers: { 'Content-Disposition': 'attachment; filename="assimbly-to-fluxygen-default-2026-10-19.zip"' },
    });
    fixture.detectChanges();

    expect(saveAs).toHaveBeenCalledWith(expect.any(Blob), 'assimbly-to-fluxygen-default-2026-10-19.zip');
    expect(activeModal.close).toHaveBeenCalledWith('assimbly-to-fluxygen-default-2026-10-19.zip');
    expect(fixture.componentInstance.passphrase()).toBe('');
    expect(fixture.componentInstance.confirmation()).toBe('');
  });

  it('shows why the Gateway refused the export and keeps the dialog open', async () => {
    await type('#fluxygen-export-passphrase', PASSPHRASE);
    await type('#fluxygen-export-confirmation', PASSPHRASE);

    submit();
    http
      .expectOne('api/environment/7/fluxygen-export')
      .flush(new Blob(['A secret could not be decrypted with this Gateway\'s key.'], { type: 'text/plain' }), {
        status: 400,
        statusText: 'Bad Request',
      });
    await shown('.fluxygen-export__failed');

    expect(element('.fluxygen-export__failed')?.textContent?.trim()).toBe("A secret could not be decrypted with this Gateway's key.");
    expect(activeModal.close).not.toHaveBeenCalled();
    expect(saveAs).not.toHaveBeenCalled();
  });

  it('forgets the passphrase when cancelled', async () => {
    await type('#fluxygen-export-passphrase', PASSPHRASE);

    element<HTMLButtonElement>('.modal-footer button[type=button]').click();

    expect(activeModal.dismiss).toHaveBeenCalled();
    expect(fixture.componentInstance.passphrase()).toBe('');
  });
});

describe('fluxygenExportProblem', () => {
  it('needs a Flow, a passphrase of 12 characters and the same confirmation', () => {
    expect(fluxygenExportProblem(0, PASSPHRASE, PASSPHRASE)).toBe('Choose at least one Flow.');
    expect(fluxygenExportProblem(1, 'x'.repeat(11), 'x'.repeat(11))).toBe('The passphrase needs at least 12 characters.');
    expect(fluxygenExportProblem(1, 'x'.repeat(12), 'x'.repeat(11))).toBe("The passphrases don't match.");
    expect(fluxygenExportProblem(1, 'x'.repeat(12), 'x'.repeat(12))).toBeNull();
  });
});

describe('attachmentName', () => {
  it('reads the file name of a Content-Disposition header', () => {
    expect(attachmentName('attachment; filename="a-b.zip"')).toBe('a-b.zip');
    expect(attachmentName('attachment; filename=a-b.zip')).toBe('a-b.zip');
    expect(attachmentName(null)).toBeNull();
  });
});

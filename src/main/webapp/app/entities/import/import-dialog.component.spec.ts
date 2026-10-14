import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';

import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { fontAwesomeIcons } from 'app/config/font-awesome-icons';

import { ImportDialogComponent } from './import-dialog.component';

@Component({ template: '' })
class ImporterStub {}

describe('Import dialog', () => {
  let fixture: ComponentFixture<ImportDialogComponent>;
  let activeModal: { close: jest.Mock; dismiss: jest.Mock };

  beforeEach(() => {
    activeModal = { close: jest.fn(), dismiss: jest.fn() };
    TestBed.configureTestingModule({
      imports: [ImportDialogComponent],
      providers: [
        provideRouter([
          { path: 'import/flow', component: ImporterStub },
          { path: 'import/camel', component: ImporterStub },
          { path: 'import/script', component: ImporterStub },
          { path: 'rest-apis/import', component: ImporterStub },
        ]),
        { provide: NgbActiveModal, useValue: activeModal },
      ],
    });
    TestBed.inject(FaIconLibrary).addIcons(...fontAwesomeIcons);
    fixture = TestBed.createComponent(ImportDialogComponent);
    fixture.detectChanges();
  });

  it('is titled Import flow', () => {
    expect(fixture.nativeElement.querySelector('.modal-title').textContent.trim()).toBe('Import flow');
  });

  it('offers a Flow (DIL), Camel XML, a script and OpenAPI, in that order', () => {
    const titles = Array.from<HTMLElement>(fixture.nativeElement.querySelectorAll('.import-choice__title')).map(e => e.textContent?.trim());

    expect(titles).toEqual(['Flow (DIL)', 'Camel XML', 'Script', 'OpenAPI']);
  });

  it('says the Flow (DIL) import takes XML or JSON', () => {
    const accepts = fixture.nativeElement.querySelector('.import-choice__accepts').textContent;

    expect(accepts).toContain('XML or JSON');
  });

  it('opens the importer of the chosen kind and closes', async () => {
    const choices: HTMLElement[] = Array.from(fixture.nativeElement.querySelectorAll('a.import-choice'));
    choices[0].click();
    await fixture.whenStable();

    expect(TestBed.inject(Router).url).toBe('/import/flow');
    expect(activeModal.close).toHaveBeenCalled();
  });

  it('closes without choosing', () => {
    fixture.nativeElement.querySelector('.btn-close').click();

    expect(activeModal.dismiss).toHaveBeenCalled();
  });
});

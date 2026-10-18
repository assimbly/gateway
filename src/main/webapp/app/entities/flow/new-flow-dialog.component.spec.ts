import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';

import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { provideTranslateService } from '@ngx-translate/core';

import { fontAwesomeIcons } from 'app/config/font-awesome-icons';

import { NewFlowDialogComponent } from './new-flow-dialog.component';

@Component({ template: '' })
class EditorStub {}

describe('New Flow dialog', () => {
  let fixture: ComponentFixture<NewFlowDialogComponent>;
  let activeModal: { close: jest.Mock; dismiss: jest.Mock };

  beforeEach(() => {
    activeModal = { close: jest.fn(), dismiss: jest.fn() };
    TestBed.configureTestingModule({
      imports: [NewFlowDialogComponent],
      providers: [
        provideRouter([
          { path: 'flow/editor', component: EditorStub },
          { path: 'rest-apis/new', component: EditorStub },
        ]),
        provideTranslateService(),
        { provide: NgbActiveModal, useValue: activeModal },
      ],
    });
    TestBed.inject(FaIconLibrary).addIcons(...fontAwesomeIcons);
    fixture = TestBed.createComponent(NewFlowDialogComponent);
    fixture.detectChanges();
  });

  it('is titled Add flow', () => {
    expect(fixture.nativeElement.querySelector('.modal-title').textContent.trim()).toBe('Add flow');
  });

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

  it('offers Visual, Camel route (low code), Script (code) and API, in that order, and no Import', () => {
    const titles = Array.from<HTMLElement>(fixture.nativeElement.querySelectorAll('.flow-type-choice__title')).map(e => e.textContent?.trim());
    const levels = Array.from<HTMLElement>(fixture.nativeElement.querySelectorAll('.flow-type-choice__level')).map(e => e.textContent?.trim());

    expect(titles).toEqual(['Visual', 'Camel route', 'Script', 'API']);
    expect(levels.slice(1, 4)).toEqual(['Low code', 'Code', 'Design']);
  });

  it('opens a new Visual Flow made from an Example Flow', async () => {
    const examples: HTMLElement[] = Array.from(fixture.nativeElement.querySelectorAll('.flow-example'));
    expect(examples.map(e => e.querySelector('.flow-example__title')?.textContent?.trim())).toEqual([
      'Folder to folder',
      'Scheduled HTTP call',
      'Route by content',
    ]);

    examples[2].click();
    await fixture.whenStable();

    const url = TestBed.inject(Router).parseUrl(TestBed.inject(Router).url);
    expect(url.root.children['primary'].segments.map(s => s.path)).toEqual(['flow', 'editor']);
    expect(url.queryParams).toEqual({ mode: 'edit', editor: 'flow', template: 'route-by-content' });
    expect(activeModal.close).toHaveBeenCalled();
  });

  function choiceNamed(name: string): HTMLElement {
    const choices: HTMLElement[] = Array.from(fixture.nativeElement.querySelectorAll('a, button'));
    const choice = choices.find(element => element.querySelector('.flow-type-choice__title')?.textContent?.trim() === name);
    if (!choice) {
      throw new Error(`No choice named ${name}`);
    }
    return choice;
  }
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { FaIconLibrary } from '@fortawesome/angular-fontawesome';

import { fontAwesomeIcons } from 'app/config/font-awesome-icons';

import { ImportComponent } from './import.component';

describe('Import page', () => {
  let fixture: ComponentFixture<ImportComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    TestBed.inject(FaIconLibrary).addIcons(...fontAwesomeIcons);
    fixture = TestBed.createComponent(ImportComponent);
    fixture.detectChanges();
  });

  it('offers a Flow (DIL), Camel XML, a script and OpenAPI, in that order', () => {
    const titles = Array.from<HTMLElement>(fixture.nativeElement.querySelectorAll('.import-choice__title')).map(e => e.textContent?.trim());

    expect(titles).toEqual(['Flow (DIL)', 'Camel XML', 'Script', 'OpenAPI']);
  });

  it('opens each importer on its own page', () => {
    const links = Array.from<HTMLAnchorElement>(fixture.nativeElement.querySelectorAll('a.import-choice')).map(a => a.getAttribute('href'));

    expect(links).toEqual(['/import/flow', '/import/camel', '/import/script', '/rest-apis/import']);
  });

  it('says in which editor each import ends up', () => {
    const targets = Array.from<HTMLElement>(fixture.nativeElement.querySelectorAll('.import-choice__target')).map(e => e.textContent?.trim());

    expect(targets).toEqual(['Opens in: Visual editor', 'Opens in: Route editor', 'Opens in: Script editor', 'Opens in: APIs']);
  });
});

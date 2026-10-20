import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { FaIconLibrary } from '@fortawesome/angular-fontawesome';

import { fontAwesomeIcons } from 'app/config/font-awesome-icons';

import Fluxygen, { FLUXYGEN_URLS } from './fluxygen';

describe('Fluxygen page', () => {
  let fixture: ComponentFixture<Fluxygen>;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    TestBed.inject(FaIconLibrary).addIcons(...fontAwesomeIcons);
    fixture = TestBed.createComponent(Fluxygen);
    fixture.detectChanges();
  });

  function links(): HTMLAnchorElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('a'));
  }

  it('says that Fluxygen is Assimbly, fully managed, on the same engine', () => {
    const text = fixture.nativeElement.textContent.replace(/\s+/g, ' ');

    expect(fixture.nativeElement.querySelector('h2').textContent).toBe('Fluxygen: Assimbly, fully managed');
    expect(text).toContain('same engine (Apache Camel and ActiveMQ)');
    expect(text).toContain('Upgrade in three steps');
  });

  it('makes Try it yourself the primary call to action', () => {
    const primary: HTMLAnchorElement = fixture.nativeElement.querySelector('.btn-fx-primary');

    expect(primary.textContent?.trim()).toBe('Try it yourself');
    expect(primary.href).toBe(FLUXYGEN_URLS.tryIt);
  });

  it('opens every fluxygen.com link in a new tab without an opener', () => {
    const external = links().filter(link => new URL(link.href).hostname.endsWith('fluxygen.com'));

    expect(external.map(link => link.href)).toEqual(expect.arrayContaining(Object.values(FLUXYGEN_URLS)));
    for (const link of external) {
      expect(link.target).toBe('_blank');
      expect(link.rel).toContain('noopener');
    }
  });

  it('points the export step to the Flows list', () => {
    expect(fixture.nativeElement.querySelector('.fluxygen__flows').getAttribute('href')).toBe('/');
  });
});

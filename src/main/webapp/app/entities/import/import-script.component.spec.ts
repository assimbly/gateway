import { Component } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';

import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { provideTranslateService } from '@ngx-translate/core';

import { fontAwesomeIcons } from 'app/config/font-awesome-icons';

import { ImportScriptComponent } from './import-script.component';

@Component({ template: '' })
class EditorStub {}

describe('Import a script', () => {
  let fixture: ComponentFixture<ImportScriptComponent>;
  let page: ImportScriptComponent;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: 'flow/editor/:id', component: EditorStub }]),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideTranslateService(),
      ],
    });
    TestBed.inject(FaIconLibrary).addIcons(...fontAwesomeIcons);
    fixture = TestBed.createComponent(ImportScriptComponent);
    page = fixture.componentInstance;
    fixture.detectChanges();
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('offers the languages of the script editor, Groovy first', () => {
    const options = Array.from<HTMLOptionElement>(fixture.nativeElement.querySelectorAll('#import-script-language option')).map(o => o.value);

    expect(options).toEqual(['groovy', 'javascript', 'simple', 'jslt', 'xslt']);
    expect(page.language()).toBe('groovy');
  });

  it('imports the script in its language, then opens the new Flow in the script editor', async () => {
    page.text.set('print("hi")');
    page.language.set('javascript');
    page.name.set('Hello');

    page.start();
    const request = http.expectOne(req => req.url === 'api/import/script');
    expect(request.request.params.get('language')).toBe('javascript');
    expect(request.request.params.get('name')).toBe('Hello');
    expect(request.request.body).toBe('print("hi")');
    request.flush({ flowId: 5, name: 'Hello', type: 'script', replaced: false, warnings: [] });
    await fixture.whenStable();

    const router = TestBed.inject(Router);
    const url = router.parseUrl(router.url);
    expect(url.root.children['primary'].segments.map(s => s.path)).toEqual(['flow', 'editor', '5']);
    expect(url.queryParams).toEqual({ mode: 'edit', editor: 'script', id: '5' });
  });

  it('takes the language and the name of the Flow from the file that is chosen', () => {
    page.onFileChosen(new File(['x'], 'nightly-cleanup.js'));

    expect(page.language()).toBe('javascript');
    expect(page.name()).toBe('nightly-cleanup');
  });

  it('keeps the language and the name when the file says nothing, or the user chose already', () => {
    page.language.set('jslt');
    page.name.set('Mine');

    page.onFileChosen(new File(['x'], 'notes.txt'));
    expect(page.language()).toBe('jslt');
    expect(page.name()).toBe('Mine');

    page.onFileChosen(new File(['x'], 'other.js'));
    expect(page.language()).toBe('javascript');
    expect(page.name()).toBe('Mine');
  });

  it('says why the Gateway refused the script', () => {
    page.text.set('puts 1');
    page.fileName.set('job.rb');

    page.start();
    http
      .expectOne(req => req.url === 'api/import/script')
      .flush({ detail: "Unknown script language 'ruby'." }, { status: 400, statusText: 'Bad Request' });
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain("Couldn't import job.rb: Unknown script language 'ruby'.");
  });

  it('can not import an empty script', () => {
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button.btn-fx-primary');
    expect(button.disabled).toBe(true);

    page.text.set('   ');
    fixture.detectChanges();
    expect(button.disabled).toBe(true);

    page.text.set('println 1');
    fixture.detectChanges();
    expect(button.disabled).toBe(false);
  });
});

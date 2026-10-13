import { Component } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';

import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { provideTranslateService } from '@ngx-translate/core';

import { fontAwesomeIcons } from 'app/config/font-awesome-icons';

import { ImportCamelComponent } from './import-camel.component';

@Component({ template: '' })
class EditorStub {}

const route = '<route id="timer-to-log" xmlns="http://camel.apache.org/schema/spring"><from uri="timer:tick"/><log message="tick"/></route>';

describe('Import Camel XML', () => {
  let fixture: ComponentFixture<ImportCamelComponent>;
  let page: ImportCamelComponent;
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
    fixture = TestBed.createComponent(ImportCamelComponent);
    page = fixture.componentInstance;
    fixture.detectChanges();
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('imports the routes, then opens the new Flow in the route editor', async () => {
    page.text.set(route);
    page.name.set('Timer');

    page.start();
    const request = http.expectOne(req => req.url === 'api/import/camel');
    expect(request.request.params.get('name')).toBe('Timer');
    expect(request.request.body).toBe(route);
    request.flush({ flowId: 9, name: 'Timer', type: 'route', replaced: false, warnings: [] });
    await fixture.whenStable();

    const router = TestBed.inject(Router);
    const url = router.parseUrl(router.url);
    expect(url.root.children['primary'].segments.map(s => s.path)).toEqual(['flow', 'editor', '9']);
    expect(url.queryParams).toEqual({ mode: 'edit', editor: 'route', id: '9' });
  });

  it('names the Flow after the file that is chosen, unless it has a name already', () => {
    page.onFileChosen(new File([route], 'timer-to-log.xml'));
    expect(page.name()).toBe('timer-to-log');

    page.onFileChosen(new File([route], 'other.xml'));
    expect(page.name()).toBe('timer-to-log');
  });

  it('refuses text that is not XML, without sending it', () => {
    page.text.set('from("timer:x").log("x")');
    page.fileName.set('Routes.java');

    page.start();
    fixture.detectChanges();

    http.expectNone(req => req.url === 'api/import/camel');
    expect(fixture.nativeElement.textContent).toContain("Routes.java isn't valid XML.");
  });

  it('says why the Gateway refused the routes', () => {
    page.text.set('<other/>');

    page.start();
    http
      .expectOne(req => req.url === 'api/import/camel')
      .flush({ detail: 'The file isn\'t Camel XML: expected <route>, <routes> or <camelContext> but found <other>.' }, { status: 400, statusText: 'Bad Request' });
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain("Couldn't import the routes: The file isn't Camel XML");
    expect(page.importing()).toBe(false);
  });
});

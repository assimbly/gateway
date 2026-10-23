import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';

import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { NgbActiveOffcanvas } from '@ng-bootstrap/ng-bootstrap';

import { fontAwesomeIcons } from 'app/config/font-awesome-icons';

import { FlowLogDrawerComponent } from './flow-log-drawer.component';

const LOG = [
  '2026-10-18T21:46:05.323+02:00  INFO 1 --- [gateway] [t] o.a.i.impl.manager.FlowManager           : Started flow successfully | flowid=1853',
  '2026-10-18T21:46:07.833+02:00  INFO 1 --- [gateway] [hello] org.assimbly.runtime.1853                : Exchange[',
  '  Body: Hello world',
  ']',
].join('\n');

describe('Flow log drawer', () => {
  let fixture: ComponentFixture<FlowLogDrawerComponent>;
  let http: HttpTestingController;
  let activeOffcanvas: { dismiss: jest.Mock };

  beforeEach(() => {
    activeOffcanvas = { dismiss: jest.fn() };
    TestBed.configureTestingModule({
      imports: [FlowLogDrawerComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting(), { provide: NgbActiveOffcanvas, useValue: activeOffcanvas }],
    });
    TestBed.inject(FaIconLibrary).addIcons(...fontAwesomeIcons);
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(FlowLogDrawerComponent);
    fixture.componentInstance.flow.set({ id: 1853, name: 'MyScript' });
    fixture.componentInstance.getLogs();
  });

  afterEach(() => http.verify());

  function respond(body: string): void {
    http.expectOne(request => request.url === 'api/logs/1/log/250' && request.params.get('flowId') === '1853').flush(body);
    fixture.detectChanges();
  }

  function output(): string {
    return fixture.nativeElement.querySelector('pre')?.textContent ?? '';
  }

  it('shows the last entries of the Flow under its name', () => {
    respond(LOG);

    expect(fixture.nativeElement.querySelector('.offcanvas-header').textContent).toContain('MyScript');
    expect(output()).toContain('Started flow successfully | flowid=1853');
    expect(output()).toContain('  Body: Hello world\n]');
  });

  it('says so when the Flow has logged nothing yet', () => {
    respond('');

    expect(fixture.nativeElement.querySelector('pre')).toBeNull();
    expect(fixture.nativeElement.textContent).toContain('No log entries for this Flow yet.');
  });

  it('filters the entries, keeping an Exchange together', () => {
    respond(LOG);

    fixture.componentInstance.searchText.set('hello world');
    fixture.detectChanges();

    expect(output()).not.toContain('Started flow successfully');
    expect(output()).toContain('Exchange[\n  Body: Hello world\n]');
  });

  it('opens the same log in the Log viewer', () => {
    respond(LOG);
    const navigate = jest.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

    fixture.componentInstance.openInLogViewer();

    expect(activeOffcanvas.dismiss).toHaveBeenCalled();
    expect(navigate).toHaveBeenCalledWith(['/admin/logviewer'], { queryParams: { flowId: 1853, name: 'MyScript' } });
  });
});

describe('Flow log in a page', () => {
  it('loads the log of the Flow it is given, without a drawer to close', () => {
    TestBed.configureTestingModule({
      imports: [FlowLogDrawerComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    TestBed.inject(FaIconLibrary).addIcons(...fontAwesomeIcons);
    const http = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(FlowLogDrawerComponent);
    fixture.componentRef.setInput('flowId', 1853);
    fixture.componentRef.setInput('flowName', 'MyScript');

    fixture.detectChanges();
    http.expectOne(request => request.url === 'api/logs/1/log/250' && request.params.get('flowId') === '1853').flush(LOG);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.offcanvas-header')).toBeNull();
    expect(fixture.nativeElement.querySelector('pre').textContent).toContain('Started flow successfully');
    http.verify();
  });
});

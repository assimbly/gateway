import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { provideTranslateService } from '@ngx-translate/core';

import { fontAwesomeIcons } from 'app/config/font-awesome-icons';
import { IFlow } from 'app/shared/model/flow.model';
import { IStep } from 'app/shared/model/step.model';

import { loadFlowGraph } from '../designer/flow-graph';
import { FlowTestPanelComponent } from './flow-test-panel.component';
import { FlowTestRun } from './flow-test-run';

const flow: IFlow = {
  id: 7,
  steps: [
    { id: 10, stepType: 'SOURCE', componentType: 'file', uri: 'in', links: [{ name: '7-11', bound: 'out' }] },
    { id: 11, stepType: 'ACTION', componentType: 'setbody', links: [{ name: '7-11', bound: 'in' }, { name: '7-12', bound: 'out' }] },
    { id: 12, stepType: 'SINK', componentType: 'file', uri: 'out', links: [{ name: '7-12', bound: 'in' }] },
  ] as IStep[],
};

const FAILED_RUN: FlowTestRun = {
  runId: 'r1',
  status: 'failed',
  durationMillis: 42,
  response: null,
  error: 'Cannot write file',
  steps: [
    {
      stepId: '11',
      status: 'completed',
      startedAt: '2026-10-23T10:00:00Z',
      ownMillis: 3,
      totalMillis: 40,
      in: { body: 'Hello', headers: { Id: '7' }, truncated: false },
      out: { body: 'Hello world', headers: { Id: '7' }, truncated: false },
    },
    {
      stepId: '12',
      status: 'failed',
      startedAt: '2026-10-23T10:00:00Z',
      ownMillis: 37,
      totalMillis: 37,
      in: { body: 'Hello world', headers: {}, truncated: false },
      out: null,
      error: 'Multiple consumers for the same endpoint is not allowed',
    },
  ],
};

describe('Flow test panel', () => {
  let fixture: ComponentFixture<FlowTestPanelComponent>;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FlowTestPanelComponent],
      providers: [provideTranslateService(), provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    TestBed.inject(FaIconLibrary).addIcons(...fontAwesomeIcons);
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(FlowTestPanelComponent);
    fixture.componentRef.setInput('flowId', 7);
    fixture.componentRef.setInput('graph', loadFlowGraph(flow));
    fixture.componentRef.setInput('running', true);
  });

  afterEach(() => http.verify());

  it('runs the message from the Step after the Source and hands the run to the editor', () => {
    fixture.detectChanges();
    const ran: FlowTestRun[] = [];
    fixture.componentInstance.ran.subscribe(run => ran.push(run));
    fixture.componentInstance.body.set('Hello');
    fixture.componentInstance.headers.set([{ key: 'Id', value: '7' }, { key: '', value: 'ignored' }]);

    runButton().click();

    const request = http.expectOne('api/flows/7/test-runs');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ entryStepId: '11', body: 'Hello', headers: { Id: '7' } });
    request.flush(FAILED_RUN);
    expect(ran).toEqual([FAILED_RUN]);
  });

  it('says why the run failed, in plain words too, and asks to select a Step', () => {
    fixture.componentRef.setInput('run', { ...FAILED_RUN, error: 'Multiple consumers for the same endpoint is not allowed' });
    fixture.detectChanges();

    expect(text('[data-cy="test-summary"]')).toContain('Failed in 42 ms');
    expect(text('[data-cy="test-error"]')).toContain('Multiple consumers for the same endpoint is not allowed');
    expect(fixture.nativeElement.textContent).toContain('Select a Step on the canvas');
    expect(runButton().textContent).toContain('Run again');
  });

  it('shows the message a selected Step got and passed on', () => {
    fixture.componentRef.setInput('run', FAILED_RUN);
    fixture.componentRef.setInput('selectedKey', 'step-11');
    fixture.detectChanges();

    expect(text('[data-cy="test-body"]')).toBe('Hello');
    expect(fixture.nativeElement.querySelector('.flow-test__headers').textContent).toContain('Id');

    buttonNamed('Out').click();
    fixture.detectChanges();

    expect(text('[data-cy="test-body"]')).toBe('Hello world');
  });

  it('tells which Steps the message never reached', () => {
    fixture.componentRef.setInput('run', { ...FAILED_RUN, steps: [FAILED_RUN.steps[0]] });
    fixture.componentRef.setInput('selectedKey', 'step-12');
    fixture.detectChanges();

    expect(text('[data-cy="test-unreached"]')).toContain("didn't reach this Step");
  });

  it('offers to start a stopped Flow instead of running', () => {
    fixture.componentRef.setInput('running', false);
    fixture.detectChanges();
    const start = jest.fn();
    fixture.componentInstance.start.subscribe(start);

    expect(runButton().disabled).toBe(true);
    expect(text('[data-cy="test-blocked"]')).toContain('Start the Flow to test it.');
    buttonNamed('Start').click();
    expect(start).toHaveBeenCalled();
  });

  it("doesn't run a Draft", () => {
    fixture.componentRef.setInput('draftReason', 'The Sink has no Component yet.');
    fixture.detectChanges();

    expect(runButton().disabled).toBe(true);
    expect(text('[data-cy="test-blocked"]')).toContain('This Flow is a Draft: The Sink has no Component yet.');
  });

  it('warns that unsaved changes are not tested, and offers to save them first', () => {
    fixture.componentRef.setInput('unsaved', true);
    fixture.detectChanges();
    const saveAndRun = jest.fn();
    fixture.componentInstance.saveAndRun.subscribe(saveAndRun);

    expect(runButton().disabled).toBe(false);
    buttonNamed('Save & restart').click();
    expect(saveAndRun).toHaveBeenCalled();
  });

  it('shows why a run could not be made', () => {
    fixture.detectChanges();

    runButton().click();
    http.expectOne('api/flows/7/test-runs').flush({ message: 'Start the Flow first' }, { status: 409, statusText: 'Conflict' });
    fixture.detectChanges();

    expect(text('[role="alert"]')).toBe('Start the Flow first');
  });

  describe('of a Route Flow', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('graph', undefined);
      fixture.componentRef.setInput('entryStepId', '21');
    });

    it('runs the message into the first Route', () => {
      fixture.detectChanges();

      runButton().click();

      expect(http.expectOne('api/flows/7/test-runs').request.body).toEqual({ entryStepId: '21', body: '', headers: {} });
    });

    it('shows the response, without the Steps and the canvas', () => {
      fixture.componentRef.setInput('run', { ...FAILED_RUN, steps: [] });
      fixture.detectChanges();

      const content = fixture.nativeElement.textContent;
      expect(content).toContain('into the first Route');
      expect(text('[data-cy="test-summary"]')).toBe('Failed in 42 ms');
      expect(content).not.toContain('Select a Step on the canvas');
      expect(content).not.toContain("Send to the Source's endpoint instead");
    });

    it('asks to save a Route that has no id yet', () => {
      fixture.componentRef.setInput('entryStepId', undefined);
      fixture.detectChanges();

      expect(text('[data-cy="test-blocked"]')).toBe('Save the Flow first.');
    });
  });

  function runButton(): HTMLButtonElement {
    return fixture.nativeElement.querySelector('[data-cy="test-run"]');
  }

  function text(selector: string): string {
    return fixture.nativeElement.querySelector(selector)?.textContent.trim();
  }

  function buttonNamed(label: string): HTMLButtonElement {
    const buttons: HTMLButtonElement[] = Array.from(fixture.nativeElement.querySelectorAll('button'));
    const button = buttons.find(b => b.textContent?.trim() === label);
    if (!button) {
      throw new Error(`No button named ${label}`);
    }
    return button;
  }
});

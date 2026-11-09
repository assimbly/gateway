import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';

import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { provideTranslateService } from '@ngx-translate/core';

import { fontAwesomeIcons } from 'app/config/font-awesome-icons';
import { Components } from 'app/shared/camel/component-type';
import { IFlow } from 'app/shared/model/flow.model';
import { IStep } from 'app/shared/model/step.model';

import { loadFlowGraph } from '../designer/flow-graph';
import { FlowTestPanelComponent } from './flow-test-panel.component';
import { FlowTestRun, TestMessage } from './flow-test-run';

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

  it('keeps the body a few lines high, so Run and its result fit below it', () => {
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.body-codemirror--compact')).not.toBeNull();
  });

  it('scrolls the result of a run into view', () => {
    const scrollIntoView = jest.fn();
    HTMLElement.prototype.scrollIntoView = scrollIntoView;
    fixture.detectChanges();
    fixture.componentInstance.ran.subscribe(run => fixture.componentRef.setInput('run', run));

    runButton().click();
    fixture.detectChanges();
    expect(scrollIntoView).not.toHaveBeenCalled();
    http.expectOne('api/flows/7/test-runs').flush(FAILED_RUN);
    fixture.detectChanges();

    expect(scrollIntoView).toHaveBeenCalledTimes(1);
    expect(scrollIntoView.mock.contexts[0]).toBe(fixture.nativeElement.querySelector('[data-cy="test-summary"]'));
    delete (HTMLElement.prototype as Partial<HTMLElement>).scrollIntoView;
  });

  it('shows the In to send and a placeholder for the Out before the first run', () => {
    fixture.componentRef.setInput('flowName', 'Orders');
    fixture.detectChanges();

    expect(text('[data-cy="test-subject"]')).toContain('Orders');
    expect(text('[data-cy="test-in"] .flow-test__part-title')).toBe('In');
    expect(fixture.nativeElement.querySelector('[data-cy="test-in"] jhi-send-message-editor')).not.toBeNull();
    expect(text('[data-cy="test-out"] .flow-test__part-title')).toBe('Out');
    expect(text('[data-cy="test-out"] [data-cy="test-placeholder"]')).toBe('Run the test to see what goes out of the Flow.');
  });

  it('says why the run failed, in plain words too, above In and Out so they line up, and points to the Steps', () => {
    fixture.componentRef.setInput('run', { ...FAILED_RUN, error: 'Multiple consumers for the same endpoint is not allowed' });
    fixture.detectChanges();

    expect(text('[data-cy="test-summary"]')).toBe('Failed 42 ms · 1 of 2 Step runs completed');
    expect(fixture.nativeElement.querySelector('.flow-test__io [data-cy="test-summary"]')).toBeNull();
    expect(text('[data-cy="test-error"]')).toContain('Multiple consumers for the same endpoint is not allowed');
    expect(fixture.nativeElement.querySelector('.flow-test__io [data-cy="test-error"]')).toBeNull();
    expect(fixture.nativeElement.textContent.replace(/\s+/g, ' ')).toContain('Click a Step on the Visual flow to see its In and Out.');
    expect(runButton().textContent).toContain('Test again');
  });

  it('puts Run under the message to send', () => {
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[data-cy="test-in"] [data-cy="test-run"]')).toBe(runButton());
  });

  it('explains the Flow, In and Out behind info icons', () => {
    fixture.detectChanges();

    expect(infos()).toContain('from the Step after the Source');
    expect(infos()).toContain('What goes into the Flow');
    expect(infos()).toContain('What goes out of the Flow');
    expect(fixture.nativeElement.textContent).not.toContain('Runs one message');
  });

  it('shows the Visual flow beside a full-page Tester, so a Step can be selected', () => {
    const shown = jest.fn();
    fixture.componentInstance.showCanvas.subscribe(shown);
    fixture.componentRef.setInput('canvasHidden', true);
    fixture.detectChanges();
    levelButton('step').click();
    fixture.detectChanges();

    (fixture.nativeElement.querySelector('[data-cy="test-show-canvas"]') as HTMLButtonElement).click();

    expect(shown).toHaveBeenCalledTimes(1);
  });

  it('says Visual flow as plain text when the canvas is in view', () => {
    fixture.detectChanges();
    levelButton('step').click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[data-cy="test-show-canvas"]')).toBeNull();
  });

  it('shows what the Flow sent back as its Out', () => {
    const response = { body: 'Done', headers: {}, truncated: false };
    fixture.componentRef.setInput('run', { ...FAILED_RUN, status: 'completed', error: null, response });
    fixture.detectChanges();

    expect(shownMessage('test-out')).toEqual(response);
  });

  it('switches to the selected Step, names it and shows its In and Out', () => {
    fixture.componentRef.setInput('run', FAILED_RUN);
    fixture.componentRef.setInput('selectedKey', 'step-11');
    fixture.detectChanges();

    expect(levelButton('step').getAttribute('aria-pressed')).toBe('true');
    expect(text('[data-cy="test-subject"]')).toContain('Step');
    expect(text('[data-cy="test-subject"]')).toContain(stepTitle('setbody'));
    expect(text('[data-cy="test-step"]')).toContain('Completed');
    expect(shownMessage('test-in')).toEqual(FAILED_RUN.steps[0].in);
    expect(shownMessage('test-out')).toEqual(FAILED_RUN.steps[0].out);
    expect(fixture.nativeElement.querySelector('jhi-send-message-editor')).toBeNull();
  });

  it('shows the Flow again with Flow, keeping the Step selected', () => {
    fixture.componentRef.setInput('run', FAILED_RUN);
    fixture.componentRef.setInput('selectedKey', 'step-11');
    fixture.detectChanges();

    levelButton('flow').click();
    fixture.detectChanges();

    expect(text('[data-cy="test-summary"]')).toContain('Failed 42 ms');
    expect(fixture.nativeElement.querySelector('jhi-send-message-editor')).not.toBeNull();

    levelButton('step').click();
    fixture.detectChanges();
    expect(shownMessage('test-in')).toEqual(FAILED_RUN.steps[0].in);
  });

  it('goes back to Flow when the Step is no longer selected', () => {
    fixture.componentRef.setInput('selectedKey', 'step-11');
    fixture.detectChanges();
    fixture.componentRef.setInput('selectedKey', undefined);
    fixture.detectChanges();

    expect(levelButton('flow').getAttribute('aria-pressed')).toBe('true');
  });

  it('asks to select a Step when Step shows none', () => {
    fixture.detectChanges();
    levelButton('step').click();
    fixture.detectChanges();

    expect(text('[data-cy="test-no-step"]')).toBe('Click a Step on the Visual flow to see its In and Out.');
  });

  it('shows the error of a failed Step under its status', () => {
    fixture.componentRef.setInput('run', FAILED_RUN);
    fixture.componentRef.setInput('selectedKey', 'step-12');
    fixture.detectChanges();

    expect(text('[data-cy="test-subject"]')).toContain('· out');
    expect(text('[data-cy="test-step"] .badge')).toBe('Failed');
    expect(text('[data-cy="test-step"]')).toContain('37 ms in this Step');
    expect(text('[data-cy="test-error"]')).toContain('Multiple consumers');
    expect(text('[data-cy="test-out"] [data-cy="test-placeholder"]')).toBe('This Step failed, so it passed nothing on.');
  });

  it('runs again from a Step', () => {
    fixture.componentRef.setInput('run', FAILED_RUN);
    fixture.componentRef.setInput('selectedKey', 'step-11');
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[data-cy="test-step"] [data-cy="test-run"]')).toBe(runButton());
    runButton().click();

    expect(http.expectOne('api/flows/7/test-runs').request.body).toEqual({ entryStepId: '11', body: '', headers: {} });
  });

  it('offers to edit the selected Step', () => {
    const edited: string[] = [];
    fixture.componentInstance.editStep.subscribe(key => edited.push(key));
    fixture.componentRef.setInput('run', FAILED_RUN);
    fixture.componentRef.setInput('selectedKey', 'step-11');
    fixture.detectChanges();

    buttonNamed('Edit Step').click();

    expect(edited).toEqual(['step-11']);
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
      expect(infos()).toContain('into the first Route');
      expect(text('[data-cy="test-summary"]')).toBe('Failed 42 ms');
      expect(content).not.toContain('Click a Step on the Visual flow');
      expect(fixture.nativeElement.querySelector('[data-cy="test-level-step"]')).toBeNull();
      expect(content).not.toContain("Send to the Source's endpoint instead");
    });

    it('asks to save a Route that has no id yet', () => {
      fixture.componentRef.setInput('entryStepId', undefined);
      fixture.detectChanges();

      expect(text('[data-cy="test-blocked"]')).toBe('Save the Flow first.');
    });
  });

  describe('of a Script Flow', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('graph', undefined);
      fixture.componentRef.setInput('entryStepId', '31');
      fixture.componentRef.setInput('entryKind', 'script');
    });

    it('runs the message into the first Script', () => {
      fixture.detectChanges();

      runButton().click();

      expect(http.expectOne('api/flows/7/test-runs').request.body).toEqual({ entryStepId: '31', body: '', headers: {} });
    });

    it('shows the response and counts the Step runs, leaving each Script to the editor', () => {
      fixture.componentRef.setInput('run', FAILED_RUN);
      fixture.detectChanges();

      const content = fixture.nativeElement.textContent;
      expect(infos()).toContain('into the first Script');
      expect(text('[data-cy="test-summary"]')).toContain('Step runs completed');
      expect(content).toContain('Each Script shows its Out on the Scripts tab.');
      expect(content).not.toContain('Click a Step on the Visual flow');
      expect(fixture.nativeElement.querySelector('[data-cy="test-level-step"]')).toBeNull();
      expect(content).toContain("Send to the Source's endpoint instead");
    });

    it('asks to save a Script that has no id yet', () => {
      fixture.componentRef.setInput('entryStepId', undefined);
      fixture.detectChanges();

      expect(text('[data-cy="test-blocked"]')).toBe('Save the Flow first.');
    });
  });

  function levelButton(level: 'flow' | 'step'): HTMLButtonElement {
    return fixture.nativeElement.querySelector(`[data-cy="test-level-${level}"]`);
  }

  /** The message shown read-only in the In or Out part. */
  function shownMessage(part: 'test-in' | 'test-out'): TestMessage | null | undefined {
    return fixture.debugElement.query(By.css(`[data-cy="${part}"] jhi-test-message`))?.componentInstance.message();
  }

  function stepTitle(componentType: string): string {
    const type = TestBed.inject(Components).types.find(t => t.name === componentType);
    return type?.title ?? componentType;
  }

  function runButton(): HTMLButtonElement {
    return fixture.nativeElement.querySelector('[data-cy="test-run"]');
  }

  function text(selector: string): string {
    return fixture.nativeElement.querySelector(selector)?.textContent.replace(/\s+/g, ' ').trim();
  }

  /** The explanations behind the info icons. */
  function infos(): string {
    return Array.from<HTMLElement>(fixture.nativeElement.querySelectorAll('[data-cy="test-info"]'))
      .map(icon => icon.getAttribute('aria-label'))
      .join(' ');
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

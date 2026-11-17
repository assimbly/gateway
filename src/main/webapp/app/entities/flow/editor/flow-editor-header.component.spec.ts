import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { provideRouter } from '@angular/router';
import { throwError } from 'rxjs';

import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

import { fontAwesomeIcons } from 'app/config/font-awesome-icons';
import { GatewayStageService } from 'app/entities/integration/gateway-stage.service';
import { EnvironmentType } from 'app/shared/model/integration.model';

import { FlowService } from '../flow.service';
import { DraftProblem, FlowEditorHeaderComponent, returnPath } from './flow-editor-header.component';

describe('the page the editor returns to', () => {
  it('takes a path of this app', () => {
    expect(returnPath('/rest-apis/5')).toBe('/rest-apis/5');
  });

  it.each([null, undefined, '', 'https://example.com', '//example.com', '/\\example.com', 'rest-apis/5'])(
    'goes to the Flows for %p',
    param => {
      expect(returnPath(param)).toBe('/');
    },
  );
});

describe('Flow editor header', () => {
  let fixture: ComponentFixture<FlowEditorHeaderComponent>;
  let name: FormControl<string>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FlowEditorHeaderComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    TestBed.inject(FaIconLibrary).addIcons(...fontAwesomeIcons);
    fixture = TestBed.createComponent(FlowEditorHeaderComponent);
    name = new FormControl('Orders', { nonNullable: true });
    fixture.componentRef.setInput('nameControl', name);
  });

  describe('the Draft badge', () => {
    const missingDirectory: DraftProblem = {
      where: 'Sink · file',
      message: 'Fill in the Directory Name in the path.',
      selection: { type: 'step', key: 'step-3' },
    };
    const undeclared: DraftProblem = {
      where: 'Response',
      message: "404 isn't a Declared response.",
      selection: { type: 'step', key: 'step-4' },
    };

    beforeEach(() => {
      fixture.componentRef.setInput('draftReason', missingDirectory.message);
      fixture.componentRef.setInput('draftProblems', [missingDirectory]);
    });

    it('warns how many issues keep the Flow from running', () => {
      fixture.detectChanges();
      const badge: HTMLButtonElement = fixture.nativeElement.querySelector('[data-cy="draft-issues"]');

      expect(badge.textContent?.trim()).toBe('Draft · 1 issue');
      expect(badge.querySelector('fa-icon')).not.toBeNull();
      expect(badge.getAttribute('aria-label')).toBe('Draft: 1 issue keeps this Flow from running. Show them');
    });

    it('lists each issue with where it is, and selects it when clicked', () => {
      fixture.componentRef.setInput('draftWarnings', [undeclared]);
      fixture.detectChanges();
      const selected = jest.fn();
      fixture.componentInstance.problemSelected.subscribe(selected);

      fixture.nativeElement.querySelector('[data-cy="draft-issues"]').click();
      fixture.detectChanges();
      const issue: HTMLButtonElement = document.querySelector('[data-cy="draft-issue"]')!;
      const warning: HTMLButtonElement = document.querySelector('[data-cy="draft-warning"]')!;

      expect(issue.textContent).toContain('Sink · file Fill in the Directory Name in the path.');
      expect(warning.textContent).toContain("Response 404 isn't a Declared response.");
      issue.click();
      expect(selected).toHaveBeenCalledWith(missingDirectory);
    });

    it('does not show Saved text once saved', () => {
      fixture.componentRef.setInput('saved', true);
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('[data-cy="save-state"]').textContent.trim()).toBe('');
    });
  });

  it('disables Save & start while the Flow is a Draft', () => {
    fixture.componentRef.setInput('draftReason', 'The Source has no Component yet.');
    fixture.detectChanges();

    expect(buttonNamed('Save & start').disabled).toBe(true);
    expect(buttonNamed('Save').disabled).toBe(false);
  });

  it('saves and starts a complete Flow with a button of its own', () => {
    fixture.detectChanges();
    const saveAndStart = jest.fn();
    fixture.componentInstance.saveAndStart.subscribe(saveAndStart);

    buttonNamed('Save & start').click();

    expect(saveAndStart).toHaveBeenCalled();
    expect(buttonNamed('Save & start').hasAttribute('ngbdropdownitem')).toBe(false);
  });

  it('renames the Flow from its labelled name field', () => {
    fixture.detectChanges();
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input[aria-label="Flow name"]');

    input.value = 'Orders to SFTP';
    input.dispatchEvent(new Event('input'));

    expect(name.value).toBe('Orders to SFTP');
  });

  it('does not nag about the name before the user tries to save', () => {
    name.setValue('');
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('#field_flowName_hint')).toBeNull();
  });

  it('says the name is missing once the user tries to save without one', () => {
    name.setValue('');
    name.addValidators(control => (control.value ? null : { required: true }));
    name.updateValueAndValidity();
    fixture.componentRef.setInput('submitted', true);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('#field_flowName_hint').textContent).toContain('Name the Flow to save it.');
  });

  it('has no back button in the header', () => {
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[data-cy="back-to-flows"]')).toBeNull();
  });

  it('offers Save & close', () => {
    fixture.detectChanges();
    const saveAndReturn = jest.fn();
    fixture.componentInstance.saveAndReturn.subscribe(saveAndReturn);

    buttonNamed('Save & close').click();

    expect(saveAndReturn).toHaveBeenCalled();
  });

  it('saves and restarts a running Flow, so the change takes effect', () => {
    fixture.componentInstance.status.set('active');
    fixture.detectChanges();
    const saveAndRestart = jest.fn();
    fixture.componentInstance.saveAndRestart.subscribe(saveAndRestart);

    buttonNamed('Save & restart').click();

    expect(saveAndRestart).toHaveBeenCalled();
    expect(buttonNamed('Save').disabled).toBe(false);
    expect(() => buttonNamed('Save & start')).toThrow();
  });

  it('restarts the Flow with its saved configuration', () => {
    const restart = jest
      .spyOn(TestBed.inject(FlowService), 'configureAndRestart')
      .mockReturnValue(throwError(() => new HttpErrorResponse({ status: 500 })));
    fixture.componentRef.setInput('flowId', 7);
    fixture.detectChanges();

    fixture.componentInstance.restart();

    expect(restart).toHaveBeenCalledWith(7);
  });

  it('turns Start red and offers the error when the Flow fails to start', () => {
    const answer = JSON.stringify({
      flow: { status: 'failed', installed: { total: 2, failed: 1 }, steps: [{ status: 'error', uri: 'file://in', message: 'Busy' }] },
    });
    jest
      .spyOn(TestBed.inject(FlowService), 'configureAndStart')
      .mockReturnValue(throwError(() => new HttpErrorResponse({ status: 500, error: answer })));
    fixture.componentRef.setInput('flowId', 7);
    fixture.detectChanges();

    buttonNamed('Start').click();
    fixture.detectChanges();

    expect(buttonNamed('Start').classList).toContain('btn-fx-danger');
    expect(buttonNamed('Error')).toBeTruthy();
    expect(fixture.componentInstance.failure()).toEqual({
      summary: '1 of 2 Steps failed to start.',
      steps: [{ uri: 'file://in', message: 'Busy' }],
    });
  });

  it('saves and starts on Ctrl+Enter and Cmd+Enter, also while typing the name', () => {
    fixture.detectChanges();
    const saveAndStart = jest.fn();
    fixture.componentInstance.saveAndStart.subscribe(saveAndStart);

    const event = ctrlEnter();
    fixture.nativeElement.querySelector('#field_flowName').dispatchEvent(event);
    document.dispatchEvent(ctrlEnter({ ctrlKey: false, metaKey: true }));

    expect(saveAndStart).toHaveBeenCalledTimes(2);
    expect(event.defaultPrevented).toBe(true);
  });

  it('saves and restarts on Ctrl+Enter while the Flow runs', () => {
    fixture.componentInstance.status.set('active');
    fixture.detectChanges();
    const saveAndStart = jest.fn();
    const saveAndRestart = jest.fn();
    fixture.componentInstance.saveAndStart.subscribe(saveAndStart);
    fixture.componentInstance.saveAndRestart.subscribe(saveAndRestart);

    document.dispatchEvent(ctrlEnter());

    expect(saveAndRestart).toHaveBeenCalled();
    expect(saveAndStart).not.toHaveBeenCalled();
  });

  it('does nothing on Ctrl+Enter while Save & start is disabled', () => {
    fixture.componentRef.setInput('draftReason', 'The Source has no Component yet.');
    fixture.detectChanges();
    const saveAndStart = jest.fn();
    fixture.componentInstance.saveAndStart.subscribe(saveAndStart);

    document.dispatchEvent(ctrlEnter());
    fixture.componentRef.setInput('draftReason', null);
    fixture.componentRef.setInput('saving', true);
    fixture.detectChanges();
    document.dispatchEvent(ctrlEnter());

    expect(saveAndStart).not.toHaveBeenCalled();
  });

  it('leaves Ctrl+Enter to a dialog on top of the editor', () => {
    jest.spyOn(TestBed.inject(NgbModal), 'hasOpenModals').mockReturnValue(true);
    fixture.detectChanges();
    const saveAndStart = jest.fn();
    fixture.componentInstance.saveAndStart.subscribe(saveAndStart);

    const event = ctrlEnter();
    document.dispatchEvent(event);

    expect(saveAndStart).not.toHaveBeenCalled();
    expect(event.defaultPrevented).toBe(false);
  });

  it('stops the running Flow on Ctrl+Shift+Enter', () => {
    const stop = jest.spyOn(TestBed.inject(FlowService), 'stop').mockReturnValue(throwError(() => new HttpErrorResponse({ status: 500 })));
    fixture.componentRef.setInput('flowId', 7);
    fixture.detectChanges();

    document.dispatchEvent(ctrlEnter({ shiftKey: true }));
    expect(stop).not.toHaveBeenCalled();

    fixture.componentInstance.status.set('active');
    document.dispatchEvent(ctrlEnter({ shiftKey: true }));
    expect(stop).toHaveBeenCalledWith(7);
  });

  it('asks before Ctrl+Shift+Enter stops a Flow on a Gateway on stage Production', () => {
    const stop = jest.spyOn(TestBed.inject(FlowService), 'stop').mockReturnValue(throwError(() => new HttpErrorResponse({ status: 500 })));
    const open = jest
      .spyOn(TestBed.inject(NgbModal), 'open')
      .mockReturnValue({ componentInstance: {}, result: new Promise(() => undefined) } as NgbModalRef);
    TestBed.inject(GatewayStageService).stage.set(EnvironmentType.PRODUCTION);
    fixture.componentRef.setInput('flowId', 7);
    fixture.detectChanges();
    fixture.componentInstance.status.set('active');

    document.dispatchEvent(ctrlEnter({ shiftKey: true }));

    expect(open).toHaveBeenCalled();
    expect((open.mock.results[0].value as NgbModalRef).componentInstance.title).toBe('Stop Orders?');
    expect(stop).not.toHaveBeenCalled();
  });

  it('opens the Test panel of the visual editor instead of the Send page, also while the Flow is stopped', () => {
    fixture.componentRef.setInput('testInEditor', true);
    fixture.componentRef.setInput('sourceComponent', 'file');
    fixture.detectChanges();
    const testRequested = jest.fn();
    fixture.componentInstance.testRequested.subscribe(testRequested);

    const send = buttonNamed('Send a message to this Flow');
    expect(send.disabled).toBe(false);
    send.click();

    expect(testRequested).toHaveBeenCalled();
  });

  it('keeps Send a message to this Flow to the Send page, while the Flow runs, outside the visual editor', () => {
    fixture.componentRef.setInput('sourceComponent', 'file');
    fixture.detectChanges();

    expect(buttonNamed('Send a message to this Flow').disabled).toBe(true);
  });

  describe('with the Design and Test modes of the visual editor', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('modes', true);
      fixture.componentRef.setInput('testInEditor', true);
      fixture.componentRef.setInput('flowId', 7);
      jest.spyOn(TestBed.inject(FlowService), 'getFlowStatus').mockReturnValue(throwError(() => new HttpErrorResponse({ status: 500 })));
    });

    it('places an icon-only Save button next to the Flow name, grey when saved and primary when unsaved, without Save & Test', () => {
      fixture.detectChanges();
      const saveEmit = jest.fn();
      fixture.componentInstance.save.subscribe(saveEmit);
      const saveButton: HTMLButtonElement = fixture.nativeElement.querySelector('.flow-editor-header__title [data-cy="flow-save"]');

      expect(saveButton).not.toBeNull();
      expect(saveButton.textContent?.trim()).toBe('');
      expect(saveButton.classList).toContain('btn-fx-icon');
      expect(saveButton.classList).toContain('btn-fx-secondary');

      fixture.componentRef.setInput('unsaved', true);
      fixture.detectChanges();
      expect(saveButton.classList).toContain('btn-fx-primary');

      saveButton.click();
      expect(saveEmit).toHaveBeenCalled();

      for (const label of ['Save & Test', 'Log', 'Camel route', 'Send a message to this Flow', 'Save & start', 'Save & close']) {
        expect(() => buttonNamed(label)).toThrow();
      }
      expect(fixture.nativeElement.querySelector('[aria-label="More save options"]')).toBeNull();
      expect(fixture.nativeElement.querySelector('[data-tour="flow-completed"]')).toBeNull();
    });

    it('switches to Test with the toggle and with T, but not while typing', () => {
      fixture.detectChanges();
      const modeChange = jest.fn();
      fixture.componentInstance.modeChange.subscribe(modeChange);
      const toggle: HTMLButtonElement = fixture.nativeElement.querySelector('[role="switch"]');
      expect(toggle.getAttribute('aria-checked')).toBe('false');

      toggle.click();
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 't', bubbles: true, cancelable: true }));
      fixture.nativeElement
        .querySelector('#field_flowName')
        .dispatchEvent(new KeyboardEvent('keydown', { key: 't', bubbles: true, cancelable: true }));

      expect(modeChange.mock.calls).toEqual([['test'], ['test']]);
    });

    it('cannot switch a Draft to Test, with the toggle or with T, and says why', () => {
      fixture.componentRef.setInput('draftReason', 'Fill in the Directory Name in the path.');
      fixture.componentRef.setInput('draftProblems', [
        { where: 'Sink · file', message: 'Fill in the Directory Name in the path.', selection: { type: 'step', key: 'step-3' } },
      ]);
      fixture.detectChanges();
      const modeChange = jest.fn();
      fixture.componentInstance.modeChange.subscribe(modeChange);
      const toggle: HTMLButtonElement = fixture.nativeElement.querySelector('[role="switch"]');

      expect(toggle.disabled).toBe(true);
      expect(fixture.componentInstance.toggleBlocked()).toBe('Finish the Draft to test it: 1 issue. Click Draft to see them.');
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 't', bubbles: true, cancelable: true }));
      expect(modeChange).not.toHaveBeenCalled();
    });

    it('can always go back from Test to Design', () => {
      fixture.componentRef.setInput('mode', 'test');
      fixture.componentRef.setInput('draftReason', 'Fill in the Directory Name in the path.');
      fixture.detectChanges();
      const modeChange = jest.fn();
      fixture.componentInstance.modeChange.subscribe(modeChange);

      fixture.nativeElement.querySelector('[role="switch"]').click();

      expect(modeChange).toHaveBeenCalledWith('design');
    });

    it('shows in Design whether the Flow runs, and leaves starting and stopping to the Test tab', () => {
      fixture.componentInstance.status.set('active');
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('[data-cy="flow-state"]').textContent.trim()).toBe('Running');
      expect(fixture.nativeElement.querySelector('jhi-status-controls')).toBeNull();
      expect(fixture.nativeElement.querySelector('[data-cy="flow-save"]')).not.toBeNull();
    });

    it('calls the editing mode Code in the Route editor', () => {
      fixture.componentRef.setInput('designLabel', 'Code');
      fixture.componentRef.setInput('designIcon', 'code');
      fixture.detectChanges();

      const options = Array.from<HTMLElement>(fixture.nativeElement.querySelectorAll('.flow-mode-toggle__option')).map(o =>
        o.textContent?.trim(),
      );
      expect(options).toEqual(['Code', 'Test']);
    });

    it('allows switching an unsaved Flow to Test so the editor can save it automatically', () => {
      fixture.componentRef.setInput('flowId', undefined);
      fixture.detectChanges();
      const modeChange = jest.fn();
      fixture.componentInstance.modeChange.subscribe(modeChange);

      const toggle: HTMLButtonElement = fixture.nativeElement.querySelector('[role="switch"]');
      expect(toggle.disabled).toBe(false);
      toggle.click();

      expect(modeChange).toHaveBeenCalledWith('test');
    });
  });

  function ctrlEnter(init: KeyboardEventInit = {}): KeyboardEvent {
    return new KeyboardEvent('keydown', { key: 'Enter', ctrlKey: true, bubbles: true, cancelable: true, ...init });
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

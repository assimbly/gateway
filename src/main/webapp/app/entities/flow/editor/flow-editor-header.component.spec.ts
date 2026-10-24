import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { provideRouter } from '@angular/router';
import { throwError } from 'rxjs';

import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { fontAwesomeIcons } from 'app/config/font-awesome-icons';

import { FlowService } from '../flow.service';
import { FlowEditorHeaderComponent } from './flow-editor-header.component';

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
    const input: HTMLInputElement = fixture.nativeElement.querySelector('#field_flowName');
    expect(fixture.nativeElement.querySelector('label[for="field_flowName"]').textContent).toContain('Flow name');

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

  it('offers Save & manage', () => {
    fixture.detectChanges();
    const saveAndReturn = jest.fn();
    fixture.componentInstance.saveAndReturn.subscribe(saveAndReturn);

    buttonNamed('Save & manage').click();

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
    const restart = jest.spyOn(TestBed.inject(FlowService), 'configureAndRestart').mockReturnValue(throwError(() => new HttpErrorResponse({ status: 500 })));
    fixture.componentRef.setInput('flowId', 7);
    fixture.detectChanges();

    fixture.componentInstance.restart();

    expect(restart).toHaveBeenCalledWith(7);
  });

  it('turns Start red and offers the error when the Flow fails to start', () => {
    const answer = JSON.stringify({ flow: { status: 'failed', installed: { total: 2, failed: 1 }, steps: [{ status: 'error', uri: 'file://in', message: 'Busy' }] } });
    jest
      .spyOn(TestBed.inject(FlowService), 'configureAndStart')
      .mockReturnValue(throwError(() => new HttpErrorResponse({ status: 500, error: answer })));
    fixture.componentRef.setInput('flowId', 7);
    fixture.detectChanges();

    buttonNamed('Start').click();
    fixture.detectChanges();

    expect(buttonNamed('Start').classList).toContain('btn-fx-danger');
    expect(buttonNamed('Error')).toBeTruthy();
    expect(fixture.componentInstance.failure()).toEqual({ summary: '1 of 2 Steps failed to start.', steps: [{ uri: 'file://in', message: 'Busy' }] });
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

  it('opens the Test panel of the visual editor instead of the Send page, also while the Flow is stopped', () => {
    fixture.componentRef.setInput('testInEditor', true);
    fixture.componentRef.setInput('sourceComponent', 'file');
    fixture.detectChanges();
    const testRequested = jest.fn();
    fixture.componentInstance.testRequested.subscribe(testRequested);

    const send = buttonNamed('Send test message');
    expect(send.disabled).toBe(false);
    send.click();

    expect(testRequested).toHaveBeenCalled();
  });

  it('keeps Send test message to the Send page, while the Flow runs, outside the visual editor', () => {
    fixture.componentRef.setInput('sourceComponent', 'file');
    fixture.detectChanges();

    expect(buttonNamed('Send test message').disabled).toBe(true);
  });

  describe('with the Design and Test modes of the visual editor', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('modes', true);
      fixture.componentRef.setInput('testInEditor', true);
      fixture.componentRef.setInput('flowId', 7);
      jest.spyOn(TestBed.inject(FlowService), 'getFlowStatus').mockReturnValue(throwError(() => new HttpErrorResponse({ status: 500 })));
    });

    it('designs with Save and Save & Test only', () => {
      fixture.detectChanges();
      const saveAndStart = jest.fn();
      fixture.componentInstance.saveAndStart.subscribe(saveAndStart);

      buttonNamed('Save & Test').click();

      expect(saveAndStart).toHaveBeenCalled();
      expect(buttonNamed('Save')).toBeTruthy();
      for (const label of ['Log', 'Camel route', 'Send test message', 'Start', 'Save & start']) {
        expect(() => buttonNamed(label)).toThrow();
      }
      expect(fixture.nativeElement.querySelector('[data-tour="flow-completed"]')).toBeNull();
    });

    it('saves, restarts and tests a running Flow', () => {
      fixture.componentInstance.status.set('active');
      fixture.detectChanges();
      const saveAndRestart = jest.fn();
      fixture.componentInstance.saveAndRestart.subscribe(saveAndRestart);

      buttonNamed('Save & Test').click();

      expect(saveAndRestart).toHaveBeenCalled();
    });

    it('switches to Test with the toggle and with T, but not while typing', () => {
      fixture.detectChanges();
      const modeChange = jest.fn();
      fixture.componentInstance.modeChange.subscribe(modeChange);
      const toggle: HTMLButtonElement = fixture.nativeElement.querySelector('[role="switch"]');
      expect(toggle.getAttribute('aria-checked')).toBe('false');

      toggle.click();
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 't', bubbles: true, cancelable: true }));
      fixture.nativeElement.querySelector('#field_flowName').dispatchEvent(new KeyboardEvent('keydown', { key: 't', bubbles: true, cancelable: true }));

      expect(modeChange.mock.calls).toEqual([['test'], ['test']]);
    });

    it('calls the editing mode Code in the Route editor', () => {
      fixture.componentRef.setInput('designLabel', 'Code');
      fixture.componentRef.setInput('designIcon', 'code');
      fixture.detectChanges();

      const options = Array.from<HTMLElement>(fixture.nativeElement.querySelectorAll('.flow-mode-toggle__option')).map(o => o.textContent?.trim());
      expect(options).toEqual(['Code', 'Test']);
    });

    it('has nothing to test before the Flow is saved', () => {
      fixture.componentRef.setInput('flowId', undefined);
      fixture.detectChanges();
      const modeChange = jest.fn();
      fixture.componentInstance.modeChange.subscribe(modeChange);

      const toggle: HTMLButtonElement = fixture.nativeElement.querySelector('[role="switch"]');
      expect(toggle.disabled).toBe(true);
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 't', bubbles: true, cancelable: true }));

      expect(modeChange).not.toHaveBeenCalled();
    });

    it('tests with the start, pause and stop controls of the Flows list', () => {
      fixture.componentRef.setInput('mode', 'test');
      fixture.componentInstance.status.set('active');
      fixture.detectChanges();
      const pause = jest.spyOn(TestBed.inject(FlowService), 'pause').mockReturnValue(throwError(() => new HttpErrorResponse({ status: 500 })));

      expect(fixture.nativeElement.querySelector('[role="switch"]').getAttribute('aria-checked')).toBe('true');
      expect(controlNamed('Stop')).toBeTruthy();
      expect(controlNamed('Restart')).toBeTruthy();
      expect(() => buttonNamed('Save')).toThrow();
      controlNamed('Pause').click();

      expect(pause).toHaveBeenCalledWith(7);
    });

    it('resumes a paused Flow', () => {
      fixture.componentRef.setInput('mode', 'test');
      fixture.componentInstance.status.set('paused');
      fixture.detectChanges();
      const resume = jest.spyOn(TestBed.inject(FlowService), 'resume').mockReturnValue(throwError(() => new HttpErrorResponse({ status: 500 })));

      controlNamed('Resume').click();

      expect(resume).toHaveBeenCalledWith(7);
    });

    it('cannot start a Draft', () => {
      fixture.componentRef.setInput('mode', 'test');
      fixture.componentRef.setInput('draftReason', 'The Source has no Component yet.');
      fixture.detectChanges();

      expect(controlNamed('Start').disabled).toBe(true);
    });

    function controlNamed(label: string): HTMLButtonElement {
      const button = fixture.nativeElement.querySelector(`jhi-status-controls button[aria-label="${label}"]`);
      if (!button) {
        throw new Error(`No control named ${label}`);
      }
      return button;
    }
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

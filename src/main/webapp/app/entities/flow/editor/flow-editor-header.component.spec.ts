import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { provideRouter } from '@angular/router';
import { throwError } from 'rxjs';

import { FaIconLibrary } from '@fortawesome/angular-fontawesome';

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

  it('allows Save & start once the Flow is complete', () => {
    fixture.detectChanges();

    expect(buttonNamed('Save & start').disabled).toBe(false);
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

  function buttonNamed(label: string): HTMLButtonElement {
    const buttons: HTMLButtonElement[] = Array.from(fixture.nativeElement.querySelectorAll('button'));
    const button = buttons.find(b => b.textContent?.trim() === label);
    if (!button) {
      throw new Error(`No button named ${label}`);
    }
    return button;
  }
});

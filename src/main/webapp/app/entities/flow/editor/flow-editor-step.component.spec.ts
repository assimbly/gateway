import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { provideRouter } from '@angular/router';
import { Subject } from 'rxjs';

import { FaIconLibrary } from '@fortawesome/angular-fontawesome';

import { fontAwesomeIcons } from 'app/config/font-awesome-icons';
import { StepType } from 'app/shared/model/step.model';

import { FlowService } from '../flow.service';
import { FlowEditorStepComponent, StepEditorRegistry } from './flow-editor-step.component';
import { SCRIPT_LANGUAGES, ScriptTrial } from './script-flow';

describe('Flow editor Script Step', () => {
  let fixture: ComponentFixture<FlowEditorStepComponent>;
  let tryScript: jest.SpyInstance;
  let trial: Subject<ScriptTrial>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FlowEditorStepComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting(), StepEditorRegistry],
    });
    TestBed.inject(FaIconLibrary).addIcons(...fontAwesomeIcons);
    trial = new Subject<ScriptTrial>();
    tryScript = jest.spyOn(TestBed.inject(FlowService), 'tryScript').mockReturnValue(trial);

    fixture = TestBed.createComponent(FlowEditorStepComponent);
    fixture.componentRef.setInput('step', { stepType: StepType.SCRIPT, componentType: 'groovy' });
    fixture.componentRef.setInput('index', 1);
    fixture.componentRef.setInput(
      'stepForm',
      new FormGroup({
        id: new FormControl(null),
        stepType: new FormControl('SCRIPT'),
        message: new FormControl(null),
        connection: new FormControl(null),
        routeName: new FormControl(null),
        routeContent: new FormControl(null),
        componentType: new FormControl('groovy'),
        // A script the user wrote, so changing the language keeps it.
        uri: new FormControl("'Hi ' + body"),
        options: new FormArray([]),
      }),
    );
    fixture.componentRef.setInput('languageComponentsNames', SCRIPT_LANGUAGES);
    fixture.detectChanges();
  });

  it('tries the script on an empty sample body by default', () => {
    tryItButton().click();
    fixture.detectChanges();

    expect(tryScript).toHaveBeenCalledWith('groovy', "'Hi ' + body", '');
    expect(tryItButton().disabled).toBe(true);
  });

  it('keeps the sample body out of the way until asked for', () => {
    expect(fixture.nativeElement.querySelector('#field_sample_body_1')).toBeNull();

    sampleBodyLink().click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('#field_sample_body_1')).not.toBeNull();
    expect(sampleBodyLink()).toBeUndefined();
  });

  it('tries the script on the sample body typed', () => {
    sampleBodyLink().click();
    fixture.detectChanges();
    const sample: HTMLTextAreaElement = fixture.nativeElement.querySelector('#field_sample_body_1');
    expect(fixture.nativeElement.querySelector('label[for="field_sample_body_1"]').textContent).toContain('Sample body');
    sample.value = 'Groovy';
    sample.dispatchEvent(new Event('input'));

    tryItButton().click();

    expect(tryScript).toHaveBeenCalledWith('groovy', "'Hi ' + body", 'Groovy');
  });

  it('shows the resulting body under the editor', async () => {
    tryItButton().click();
    trial.next({ ok: true, body: 'Hello world' });
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.script-trial-result').textContent).toContain('Hello world');
    expect(tryItButton().disabled).toBe(false);
  });

  it("shows a broken script's error under the editor", async () => {
    tryItButton().click();
    trial.next({ ok: false, error: 'Syntax Error: unexpected token' });
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain('Syntax Error: unexpected token');
  });

  it('forgets the last result when the language changes', async () => {
    tryItButton().click();
    trial.next({ ok: true, body: 'Hello world' });
    fixture.componentInstance.onScriptLanguageChange('python');
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.script-trial-result')).toBeNull();
  });

  function tryItButton(): HTMLButtonElement {
    const buttons: HTMLButtonElement[] = Array.from(fixture.nativeElement.querySelectorAll('.script-trial button'));
    return buttons[0];
  }

  function sampleBodyLink(): HTMLButtonElement | undefined {
    const buttons: HTMLButtonElement[] = Array.from(fixture.nativeElement.querySelectorAll('.script-trial button'));
    return buttons.find(button => button.textContent?.trim() === 'With a sample body');
  }
});

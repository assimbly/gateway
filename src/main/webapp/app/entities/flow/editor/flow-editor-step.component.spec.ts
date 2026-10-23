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

describe('Flow editor Component Step', () => {
  let fixture: ComponentFixture<FlowEditorStepComponent>;

  const bridgeErrorHandler = { name: 'bridgeErrorHandler', displayName: 'Bridge error handler', type: 'boolean', defaultValue: false };
  const expression = { name: 'expression', displayName: 'Expression', type: 'string' };

  function render(componentType: string, uriPlaceholder: string, options: Array<{ key: string; value: string }>): void {
    TestBed.configureTestingModule({
      imports: [FlowEditorStepComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting(), StepEditorRegistry],
    });
    TestBed.inject(FaIconLibrary).addIcons(...fontAwesomeIcons);

    fixture = TestBed.createComponent(FlowEditorStepComponent);
    // A saved Step, so no Options are suggested on top of its own.
    fixture.componentRef.setInput('step', { stepType: StepType.ACTION, componentType, options: 'saved' });
    fixture.componentRef.setInput('index', 1);
    fixture.componentRef.setInput(
      'stepForm',
      new FormGroup({
        id: new FormControl(null),
        stepType: new FormControl('ACTION'),
        message: new FormControl(null),
        connection: new FormControl(null),
        componentType: new FormControl(componentType),
        uri: new FormControl(''),
        options: new FormArray(
          options.map(option => new FormGroup({ key: new FormControl(option.key), value: new FormControl(option.value), defaultValue: new FormControl('') })),
        ),
      }),
    );
    fixture.componentRef.setInput('stepOptions', options.map(option => ({ ...option })));
    fixture.componentRef.setInput('componentOptions', [bridgeErrorHandler, expression]);
    fixture.componentRef.setInput('uriPlaceholder', uriPlaceholder);
    fixture.detectChanges();
  }

  function pathField(): HTMLInputElement {
    return fixture.nativeElement.querySelector('#field_uri_1');
  }

  afterEach(() => document.body.querySelectorAll('.dropdown-menu').forEach(menu => menu.remove()));

  it("keeps the Path of a Component that doesn't read one in place, read-only", () => {
    render('setbody', '', []);

    expect(pathField().readOnly).toBe(true);
    expect(pathField().placeholder).toBe('Set body has no path');
    expect(fixture.nativeElement.querySelector('[aria-label="Insert a Variable"]')).toBeNull();
  });

  it('lets a Path be typed, with its actions next to its label', () => {
    render('file', 'file:directoryName', []);

    expect(pathField().readOnly).toBe(false);
    const actions: HTMLElement = pathField().closest('.step-field')!.querySelector('.step-field__head .step-field__actions')!;
    expect(actions.querySelector('[aria-label="Insert a Variable"]')).not.toBeNull();
    expect(actions.querySelector('[aria-label="Edit the path in a larger editor"]')).not.toBeNull();
  });

  it('shows an unset switch Option as off by default', () => {
    render('file', 'file:directoryName', [{ key: 'bridgeErrorHandler', value: '' }]);

    const field: HTMLElement = fixture.nativeElement.querySelector('.option-row__switch');
    expect(field.textContent).toContain('Off');
    expect(field.querySelector('.text-muted')?.textContent).toBe('(default)');
    expect((field.querySelector('[role="switch"]') as HTMLInputElement).checked).toBe(false);
  });

  it('removes the first Option from its menu', () => {
    render('file', 'file:directoryName', [{ key: 'expression', value: '${body}' }]);

    menuItem(0, 'Remove option').click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('.option-row').length).toBe(0);
    expect(fixture.componentInstance.stepOptions.length).toBe(0);
  });

  it('puts a picked Variable in a switch Option, making it a text field', () => {
    render('file', 'file:directoryName', [{ key: 'bridgeErrorHandler', value: 'true' }]);

    fixture.componentInstance.insertVariableIntoOption(0, 'flag');
    fixture.detectChanges();

    expect(fixture.componentInstance.optionValue(0)).toBe('@{flag}');
    expect(fixture.componentInstance.valueField(0)).toBe('text');
  });

  it('offers the expression languages for a language Option', () => {
    render('setheader', 'setheader:name', [{ key: 'language', value: 'jsonpath' }]);

    const select: HTMLSelectElement = fixture.nativeElement.querySelector('#field_options-value-1-0');
    const choices = Array.from(select.options).map(option => option.textContent?.trim());
    expect(choices).toEqual(expect.arrayContaining(['constant', 'simple', 'groovy', 'xpath', 'jsonpath']));
    expect(select.options[select.selectedIndex].textContent?.trim()).toBe('jsonpath');
  });

  it('starts a language Option on Simple', () => {
    render('setheader', 'setheader:name', [{ key: 'language', value: '' }]);

    fixture.componentInstance.changeOptionSelection('language', 0);

    expect(fixture.componentInstance.optionValue(0)).toBe('simple');
  });

  function menuItem(row: number, text: string): HTMLButtonElement {
    const toggle: HTMLButtonElement = fixture.nativeElement.querySelectorAll('.option-row [aria-label="More for this option"]')[row];
    toggle.click();
    fixture.detectChanges();
    const items: HTMLButtonElement[] = Array.from(document.body.querySelectorAll('.dropdown-menu.show [ngbdropdownitem]'));
    return items.find(item => item.textContent?.trim() === text)!;
  }
});

describe('Flow editor Route Step', () => {
  const broker = { id: 1, name: 'Gateway broker', type: 'ActiveMQ' };
  const database = { id: 2, name: 'Orders database', type: 'SQL' };

  function render(stepType: StepType, activeEditor: string): FlowEditorStepComponent {
    TestBed.configureTestingModule({
      imports: [FlowEditorStepComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting(), StepEditorRegistry],
    });
    TestBed.inject(FaIconLibrary).addIcons(...fontAwesomeIcons);

    const fixture = TestBed.createComponent(FlowEditorStepComponent);
    fixture.componentRef.setInput('step', { stepType, componentType: '' });
    fixture.componentRef.setInput('index', 1);
    fixture.componentRef.setInput(
      'stepForm',
      new FormGroup({
        id: new FormControl(null),
        stepType: new FormControl(stepType),
        message: new FormControl(null),
        connection: new FormControl(null),
        componentType: new FormControl(''),
        uri: new FormControl(''),
        route: new FormControl(null),
        routeName: new FormControl(''),
        routeContent: new FormControl(''),
        options: new FormArray([]),
      }),
    );
    fixture.componentRef.setInput('activeEditor', activeEditor);
    fixture.componentRef.setInput('connections', [broker, database]);
    fixture.componentRef.setInput('filterConnection', []);
    fixture.componentRef.setInput('enableConnection', true);
    fixture.detectChanges();
    return fixture.componentInstance;
  }

  it('offers every Connection to a Route', () => {
    expect(render(StepType.ROUTE, 'route').connectionChoices).toEqual([broker, database]);
  });

  it('offers every Connection to the Error handler of a Route Flow', () => {
    expect(render(StepType.ERROR, 'route').connectionChoices).toEqual([broker, database]);
  });

  it('offers the Error handler of a visual Flow only the Connections of its Component', () => {
    expect(render(StepType.ERROR, 'flow').connectionChoices).toEqual([]);
  });
});

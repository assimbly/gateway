import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { provideRouter } from '@angular/router';
import { Subject, of } from 'rxjs';

import { FaIconLibrary } from '@fortawesome/angular-fontawesome';

import { fontAwesomeIcons } from 'app/config/font-awesome-icons';
import { KnownVariable, VariableKeysService } from 'app/entities/environment-variables/variable-keys.service';
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

  function render(
    componentType: string,
    uriPlaceholder: string,
    options: Array<{ key: string; value: string }>,
    variables: KnownVariable[] | null = null,
  ): void {
    const known = { known: () => of(variables) };
    TestBed.configureTestingModule({
      imports: [FlowEditorStepComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        StepEditorRegistry,
        ...(variables ? [{ provide: VariableKeysService, useValue: known }] : []),
      ],
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

  it('shows each Variable with its value, hides an encrypted value, and sets Manage Variables apart', () => {
    render('file', 'file:directoryName', [], [
      { key: 'messages', value: 'C:/Users/me/messages', encrypted: false },
      { key: 'password', value: 'ENC(abc)', encrypted: true },
    ]);

    (fixture.nativeElement.querySelector('[aria-label="Insert a Variable"]') as HTMLButtonElement).click();
    fixture.detectChanges();

    const menu: HTMLElement = document.body.querySelector('.dropdown-menu.show')!;
    expect(menu.querySelector('.dropdown-header')?.textContent).toBe('Insert a Variable');
    const rows = Array.from(menu.querySelectorAll('.variable-menu__item'));
    expect(rows.map(row => row.querySelector('.variable-menu__key')?.textContent)).toEqual(['messages', 'password']);
    expect(rows[0].querySelector('.variable-menu__value')?.textContent).toBe('C:/Users/me/messages');
    expect(rows[1].textContent).toContain('encrypted');
    expect(rows[1].textContent).not.toContain('ENC(abc)');
    const manage = menu.querySelector('.variable-menu__manage')!;
    expect(manage.textContent?.trim()).toBe('Manage Variables');
    expect(manage.previousElementSibling?.classList).toContain('dropdown-divider');
  });

  it('shows the values of the Variables a Path or Option refers to when hovering it', () => {
    render('file', 'file:directoryName', [{ key: 'expression', value: 'x=@{password}' }], [
      { key: 'messages', value: 'C:/Users/me/messages', encrypted: false },
      { key: 'password', value: 'ENC(abc)', encrypted: true },
    ]);

    pathField().value = '@{messages}/in';
    pathField().dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(pathField().title).toBe('@{messages} = C:/Users/me/messages');
    expect((fixture.nativeElement.querySelector('#field_options-value-1-0') as HTMLInputElement).title).toBe('@{password}: encrypted');
  });

  it("lists the Flow's own Variables apart from the global ones, and uses the Flow's value", () => {
    render('file', 'file:directoryName', [], [{ key: 'messages', value: 'C:/Users/me/messages', encrypted: false }]);
    fixture.componentRef.setInput('flowVariables', { messages: '/flow/messages', inbox: '/flow/in' });
    fixture.detectChanges();

    (fixture.nativeElement.querySelector('[aria-label="Insert a Variable"]') as HTMLButtonElement).click();
    fixture.detectChanges();

    const menu: HTMLElement = document.body.querySelector('.dropdown-menu.show')!;
    expect(Array.from(menu.querySelectorAll('.variable-menu__group')).map(header => header.textContent)).toEqual(['This Flow', 'Global']);
    expect(Array.from(menu.querySelectorAll('.variable-menu__key')).map(key => key.textContent)).toEqual(['messages', 'inbox', 'messages']);

    pathField().value = '@{messages}/@{inbox}';
    pathField().dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(pathField().title).toBe('@{messages} = /flow/messages\n@{inbox} = /flow/in');
    expect(fixture.componentInstance.unknownVariablesWarning).toBeUndefined();
  });

  function menuItem(row: number, text: string): HTMLButtonElement {
    const toggle: HTMLButtonElement = fixture.nativeElement.querySelectorAll('.option-row [aria-label="More for this option"]')[row];
    toggle.click();
    fixture.detectChanges();
    const items: HTMLButtonElement[] = Array.from(document.body.querySelectorAll('.dropdown-menu.show [ngbdropdownitem]'));
    return items.find(item => item.textContent?.trim() === text)!;
  }
});

describe('Flow editor Router Step', () => {
  let fixture: ComponentFixture<FlowEditorStepComponent>;

  const language = { name: 'language', displayName: 'Language', type: 'string' };
  const expression = { name: 'expression', displayName: 'Expression', type: 'string', required: true };
  const streaming = { name: 'streaming', displayName: 'Streaming', type: 'boolean', defaultValue: false };

  /** A split Router on the canvas, as an imported one that still holds a Condition in its own Options. */
  function render(options: Array<{ key: string; value: string }>, step: object = { options: 'saved' }): FlowEditorStepComponent {
    TestBed.configureTestingModule({
      imports: [FlowEditorStepComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting(), StepEditorRegistry],
    });
    TestBed.inject(FaIconLibrary).addIcons(...fontAwesomeIcons);

    fixture = TestBed.createComponent(FlowEditorStepComponent);
    fixture.componentRef.setInput('step', { stepType: StepType.ROUTER, componentType: 'split', ...step });
    fixture.componentRef.setInput('index', 1);
    fixture.componentRef.setInput(
      'stepForm',
      new FormGroup({
        id: new FormControl(null),
        stepType: new FormControl('ROUTER'),
        message: new FormControl(null),
        connection: new FormControl(null),
        componentType: new FormControl('split'),
        uri: new FormControl(''),
        options: new FormArray(
          options.map(option => new FormGroup({ key: new FormControl(option.key), value: new FormControl(option.value), defaultValue: new FormControl('') })),
        ),
      }),
    );
    fixture.componentRef.setInput('onCanvas', true);
    fixture.componentRef.setInput('routerTitle', 'Split');
    fixture.componentRef.setInput('conditionBranch', 'split');
    fixture.componentRef.setInput('stepOptions', options.map(option => ({ ...option })));
    fixture.componentRef.setInput('componentOptions', [language, expression, streaming]);
    fixture.detectChanges();
    return fixture.componentInstance;
  }

  function editBranchButton(): HTMLButtonElement | null {
    return fixture.nativeElement.querySelector('[data-cy="edit-condition-branch"]');
  }

  it('keeps the Path of a Router in place, read-only', () => {
    render([]);
    const path: HTMLInputElement = fixture.nativeElement.querySelector('#field_uri_1');

    expect(path.readOnly).toBe(true);
    expect(path.classList).toContain('step-field__unused');
    expect(path.placeholder).toBe('Split has no path');
  });

  it("doesn't offer the language and expression of a Condition held by a Branch", () => {
    const step = render([]);

    expect(step.optionChoices.map(option => option.name)).toEqual(['streaming']);
    expect(step.missingRequiredOptions).toEqual([]);
  });

  it("doesn't suggest them for a new Router either", () => {
    render([], { options: undefined });

    const keys = (fixture.componentInstance.stepForm.get('options') as FormArray).controls.map(option => option.get('key')?.value);
    expect(keys).not.toContain('language');
    expect(keys).not.toContain('expression');
  });

  it('shows a Condition left in the Options as unused, and can remove it', () => {
    const step = render([
      { key: 'expression', value: '/persons/person' },
      { key: 'streaming', value: 'true' },
    ]);
    const value: HTMLInputElement = fixture.nativeElement.querySelector('#field_options-value-1-0');

    expect(value.readOnly).toBe(true);
    expect(value.classList).toContain('step-field__unused');
    expect(value.value).toBe('/persons/person');

    (fixture.nativeElement.querySelector('.option-row [aria-label="Remove option"]') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(step.stepOptions.map(option => option.key)).toEqual(['streaming']);
  });

  it('points to the Branch that holds the Condition, and opens it', () => {
    const step = render([]);
    const opened = jest.fn();
    step.editBranch.subscribe(opened);

    expect(fixture.nativeElement.querySelector('[data-cy="condition-branch-hint"]').textContent).toContain(
      'The Condition (language and expression) is set on the split Branch: select its arrow on the canvas.',
    );
    expect(editBranchButton()!.textContent?.trim()).toBe('Edit the split Branch');

    editBranchButton()!.click();
    expect(opened).toHaveBeenCalled();
  });

  it('leaves the Condition Options alone for a Router without such a Branch', () => {
    const step = render([]);
    fixture.componentRef.setInput('conditionBranch', undefined);
    fixture.detectChanges();

    expect(step.optionChoices.map(option => option.name)).toEqual(expect.arrayContaining(['language', 'expression']));
    expect(editBranchButton()).toBeNull();
  });
});

describe('Flow editor Route Step', () => {
  const broker = { id: 1, name: 'Gateway broker', type: 'ActiveMQ' };
  const database = { id: 2, name: 'Orders database', type: 'SQL' };

  let fixture: ComponentFixture<FlowEditorStepComponent>;

  function render(stepType: StepType, activeEditor: string, enableConnection = true): FlowEditorStepComponent {
    TestBed.configureTestingModule({
      imports: [FlowEditorStepComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting(), StepEditorRegistry],
    });
    TestBed.inject(FaIconLibrary).addIcons(...fontAwesomeIcons);

    fixture = TestBed.createComponent(FlowEditorStepComponent);
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
    fixture.componentRef.setInput('enableConnection', enableConnection);
    fixture.detectChanges();
    return fixture.componentInstance;
  }

  afterEach(() => document.body.querySelectorAll('.dropdown-menu').forEach(menu => menu.remove()));

  function addButton(): HTMLButtonElement {
    return fixture.nativeElement.querySelector('[data-tour="step-add"]');
  }

  function addConnectionLink(): HTMLButtonElement | null {
    return fixture.nativeElement.querySelector('[data-tour="step-add-connection"]');
  }

  function removeConnectionButton(): HTMLButtonElement | null {
    return fixture.nativeElement.querySelector('[data-tour="step-remove-connection"]');
  }

  it('leaves adding a Route to the list below the Routes, and calls its code the Camel route', () => {
    render(StepType.ROUTE, 'route');

    expect(addButton()).toBeNull();
    expect(fixture.nativeElement.querySelector('label[for="field_routeContent_1"]').textContent.trim()).toBe('Camel route');
  });

  it('can remove even the first Route while the Flow has others, and drag it by its handle', () => {
    render(StepType.ROUTE, 'route');
    fixture.componentRef.setInput('index', 0);
    fixture.detectChanges();
    const remove = () => fixture.nativeElement.querySelector('.step-card__remove');
    expect(remove()).toBeNull();
    expect(fixture.nativeElement.querySelector('.step-card__drag')).toBeNull();

    fixture.componentRef.setInput('deletable', true);
    fixture.componentRef.setInput('draggable', true);
    fixture.detectChanges();

    expect(remove().getAttribute('aria-label')).toBe('Remove route');
    expect(fixture.nativeElement.querySelector('.step-card__drag')).not.toBeNull();
  });

  it('reveals the Connection of a Route in place', () => {
    const step = render(StepType.ROUTE, 'route', false);
    const added = jest.fn();
    step.addConnection.subscribe(added);

    addConnectionLink()!.click();
    expect(added).toHaveBeenCalledWith({ step: step.step, index: 1 });
  });

  it('hides the Connection link once the Connection is shown', () => {
    render(StepType.ROUTE, 'route');

    expect(addConnectionLink()).toBeNull();
  });

  it('removes the Connection added to a Route', () => {
    const step = render(StepType.ROUTE, 'route');
    const removed = jest.fn();
    step.removeConnection.subscribe(removed);

    removeConnectionButton()!.click();
    expect(removed).toHaveBeenCalledWith({ step: step.step, index: 1 });
  });

  it('removes the Connection added to the Error handler of a Route Flow', () => {
    render(StepType.ERROR, 'route');

    expect(removeConnectionButton()?.getAttribute('aria-label')).toBe('Remove connection');
  });

  it("keeps the Connection of a Component that needs one, so it can't be removed", () => {
    render(StepType.ACTION, 'flow');

    expect(removeConnectionButton()).toBeNull();
  });

  it('leaves adding a Script to the list below the Scripts, and reveals its Connection in place', () => {
    render(StepType.SCRIPT, 'script', false);

    expect(addButton()).toBeNull();
    expect(addConnectionLink()).not.toBeNull();
  });

  it('can remove a Script while the Flow has others, and drag it by its handle', () => {
    render(StepType.SCRIPT, 'script');
    const remove = () => fixture.nativeElement.querySelector('.step-card__remove');
    const drag = () => fixture.nativeElement.querySelector('.step-card__drag');
    expect(remove()).toBeNull();
    expect(drag()).toBeNull();

    fixture.componentRef.setInput('deletable', true);
    fixture.componentRef.setInput('draggable', true);
    fixture.detectChanges();

    expect(remove().getAttribute('aria-label')).toBe('Remove step');
    expect(drag().getAttribute('aria-label')).toBe('Drag to move this Script');
  });

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

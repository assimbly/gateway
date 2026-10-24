import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { DefaultUrlSerializer, UrlTree } from '@angular/router';

import { Step, StepType } from 'app/shared/model/step.model';

import { FlowEditorEsbComponent } from './flow-editor-esb.component';

describe('Flow editor Connection of a Step', () => {
  function stepForm(connection: number | null): FormGroup {
    return new FormGroup({
      id: new FormControl(7),
      stepType: new FormControl(StepType.ROUTE),
      componentType: new FormControl(''),
      uri: new FormControl(''),
      message: new FormControl(null),
      route: new FormControl(3),
      connection: new FormControl(connection),
    });
  }

  /** The editor with one Route Step that has a Connection, without rendering it. */
  function editor(step: Step): FlowEditorEsbComponent {
    const component = Object.create(FlowEditorEsbComponent.prototype) as FlowEditorEsbComponent;
    component.steps = [step];
    component.enableConnection = [true];
    component.editFlowForm = new FormGroup({ stepsData: new FormArray([stepForm(step.connectionId)]) });
    return component;
  }

  it('saves the Step without the Connection once it is removed', () => {
    const step = new Step(7, StepType.ROUTE);
    step.connectionId = 1;
    const component = editor(step);

    component.removeConnection(step, 0);
    component.setDataFromFormOnStep(step, component.stepFormAt(0).controls, 0);

    expect(step.connectionId).toBeNull();
    expect(step.routeId).toBe(3);
  });

  it('hides the Connection field and marks the Flow as changed', () => {
    const step = new Step(7, StepType.ROUTE);
    step.connectionId = 1;
    const component = editor(step);

    component.removeConnection(step, 0);

    expect(component.enableConnection[0]).toBe(false);
    expect(component.editFlowForm.dirty).toBe(true);
  });
});

describe('Flow editor modes', () => {
  const serializer = new DefaultUrlSerializer();

  /** The visual editor of a saved Flow in Design, without rendering it; its URL is kept in `url`. */
  function editor(flowId: number | null = 7): { component: FlowEditorEsbComponent; url: () => string } {
    const component = Object.create(FlowEditorEsbComponent.prototype) as FlowEditorEsbComponent;
    let url = '/flow/editor/7?mode=edit&editor=flow&id=7';
    Object.assign(component, {
      viewMode: 'design',
      testView: 'flow',
      testPanelTab: 'test',
      sidePanelCollapsed: true,
      selection: { type: 'flow' },
      flow: { id: flowId },
      activeEditor: 'flow',
      editFlowForm: new FormGroup({}),
      cdr: { markForCheck: jest.fn() },
      router: {
        parseUrl: (path: string) => serializer.parse(path),
        serializeUrl: (tree: UrlTree) => serializer.serialize(tree),
        createUrlTree: (commands: unknown[], extras: { queryParams: Record<string, unknown> }) =>
          serializer.parse(`${commands.join('/')}?${Object.entries(extras.queryParams).filter(([, value]) => value !== undefined).map(([key, value]) => `${key}=${value}`).join('&')}`),
        navigate: jest.fn(),
      },
      location: { path: () => url, replaceState: (next: string) => (url = next) },
    });
    return { component, url: () => url };
  }

  it('tests the saved Flow with its panel open, and keeps the mode in the URL without loading the Flow again', () => {
    const { component, url } = editor();

    component.setMode('test');

    expect(component.viewMode).toBe('test');
    expect(component.testOpen).toBe(true);
    expect(component.sidePanelCollapsed).toBe(false);
    expect(url()).toBe('/flow/editor/7?mode=edit&editor=flow&id=7&view=test');
    expect((component as any).router.navigate).not.toHaveBeenCalled();

    component.setMode('design');

    expect(component.testOpen).toBe(false);
    expect(url()).toBe('/flow/editor/7?mode=edit&editor=flow&id=7');
  });

  it('has nothing to test before the Flow is saved', () => {
    const { component, url } = editor(null);

    component.setMode('test');

    expect(component.viewMode).toBe('design');
    expect(url()).not.toContain('view=test');
  });

  it('leaves the canvas keys alone in Test', () => {
    const { component } = editor();
    (component as any).designer = {};
    component.selection = { type: 'step', key: 's1' };
    const deleteStep = jest.spyOn(component, 'onDeleteStep').mockImplementation(() => undefined);
    component.setMode('test');

    component.onDesignerKeydown(new KeyboardEvent('keydown', { key: 'Delete' }));

    expect(deleteStep).not.toHaveBeenCalled();
  });

  it('goes back to Design to edit a Step from Test', () => {
    const { component } = editor();
    component.setMode('test');

    component.editStepFromTest('s1');

    expect(component.viewMode).toBe('design');
    expect(component.selection).toEqual({ type: 'step', key: 's1' });
  });

  it('switches to Test once Save & Test saved the Flow', () => {
    const { component, url } = editor();
    const start = jest.fn();
    Object.assign(component, { afterSaveAction: 'start', designer: {}, header: { start }, refreshCanvas: jest.fn() });

    (component as any).afterSave();

    expect(start).toHaveBeenCalledWith(7);
    expect(component.viewMode).toBe('test');
    expect(url()).toContain('view=test');
  });
});

describe('Route editor', () => {
  const serializer = new DefaultUrlSerializer();

  function routeForm(id: number | null, stepType: StepType, routeName: string, routeContent = '<route/>'): FormGroup {
    return new FormGroup({
      id: new FormControl(id),
      stepType: new FormControl(stepType),
      routeName: new FormControl(routeName),
      routeContent: new FormControl(routeContent),
    });
  }

  /** A saved Route Flow with Routes A and B and its Error handler, without rendering it; its URL is kept in `url`. */
  function editor(): { component: FlowEditorEsbComponent; url: () => string } {
    const component = Object.create(FlowEditorEsbComponent.prototype) as FlowEditorEsbComponent;
    let url = '/flow/editor/7?mode=edit&editor=route&id=7';
    Object.assign(component, {
      viewMode: 'design',
      testView: 'flow',
      testPanelTab: 'test',
      sidePanelCollapsed: true,
      selection: { type: 'flow' },
      flow: { id: 7 },
      activeEditor: 'route',
      steps: [new Step(1, StepType.ROUTE), new Step(2, StepType.ROUTE), new Step(3, StepType.ERROR)],
      stepsToDelete: [],
      numberOfSteps: 3,
      stepsOptions: [['a'], ['b'], ['e']],
      componentOptions: [['a'], ['b'], ['e']],
      selectedOptions: [['a'], ['b'], ['e']],
      enableConnection: [true, false, false],
      enableMessage: [false, true, false],
      filterConnection: [['a'], ['b'], ['e']],
      connectionType: ['a', 'b', 'e'],
      uriPlaceholders: [],
      uriPopoverMessages: [],
      URIList: [[]],
      componentTypeCamelLinks: [],
      editFlowForm: new FormGroup({
        stepsData: new FormArray([
          routeForm(1, StepType.ROUTE, 'A'),
          routeForm(2, StepType.ROUTE, 'B'),
          routeForm(3, StepType.ERROR, '', ''),
        ]),
      }),
      cdr: { markForCheck: jest.fn(), detectChanges: jest.fn() },
      router: { parseUrl: (path: string) => serializer.parse(path), serializeUrl: (tree: UrlTree) => serializer.serialize(tree) },
      location: { path: () => url, replaceState: (next: string) => (url = next) },
    });
    return { component, url: () => url };
  }

  const names = (component: FlowEditorEsbComponent) => (component.editFlowForm.controls.stepsData as FormArray).controls.map(form => form.value.routeName);

  it('moves a Route with its form and everything else it has at its place, before the Error handler', () => {
    const { component } = editor();

    component.moveRoute(1, 0);

    expect(component.steps.map(step => step.id)).toEqual([2, 1, 3]);
    expect(names(component)).toEqual(['B', 'A', '']);
    expect(component.stepsOptions).toEqual([['b'], ['a'], ['e']]);
    expect(component.enableConnection).toEqual([false, true, false]);
    expect(component.enableMessage).toEqual([true, false, false]);
    expect(component.connectionType).toEqual(['b', 'a', 'e']);
    expect(component.editFlowForm.dirty).toBe(true);
  });

  it('can remove the first Route while the Flow has another, and deletes it on save', () => {
    const { component } = editor();
    const first = component.steps[0];

    component.removeStep(first, 0);

    expect(component.steps.map(step => step.id)).toEqual([2, 3]);
    expect(names(component)).toEqual(['B', '']);
    expect(component.stepsToDelete).toEqual([first]);
    expect(component.editFlowForm.dirty).toBe(true);
  });

  it('keeps its only Route, and does not delete it on save', () => {
    const { component } = editor();
    component.removeStep(component.steps[1], 1);
    const only = component.steps[0];

    component.removeStep(only, 0);

    expect(component.steps[0]).toBe(only);
    expect(component.stepsToDelete).not.toContain(only);
  });

  it('sends a test message into the first Route that is not a routeConfiguration', () => {
    const { component } = editor();
    expect(component.routeEntryStepId).toBe('1');

    component.stepFormAt(0).patchValue({ routeContent: '<routeConfiguration id="c"/>' });

    expect(component.routeEntryStepId).toBe('2');
  });

  it('has a Code and a Test mode, kept in the URL', () => {
    const { component, url } = editor();

    component.setMode('test');

    expect(component.hasModes).toBe(true);
    expect(component.viewMode).toBe('test');
    expect(component.testTabs.map(tab => tab.label)).toEqual(['Routes', 'Log', 'Camel route']);
    expect(url()).toBe('/flow/editor/7?mode=edit&editor=route&id=7&view=test');
  });
});

describe('Script editor', () => {
  const serializer = new DefaultUrlSerializer();

  function stepForm(id: number, stepType: StepType, componentType: string): FormGroup {
    return new FormGroup({
      id: new FormControl(id),
      stepType: new FormControl(stepType),
      componentType: new FormControl(componentType),
      uri: new FormControl(''),
    });
  }

  /** A saved Script Flow: its Source, Scripts 2 and 3, the Log of the result and the Error handler, without rendering it. */
  function editor(): { component: FlowEditorEsbComponent; url: () => string } {
    const component = Object.create(FlowEditorEsbComponent.prototype) as FlowEditorEsbComponent;
    let url = '/flow/editor/7?mode=edit&editor=script&id=7';
    const types: [StepType, string][] = [
      [StepType.SOURCE, 'scheduler'],
      [StepType.SCRIPT, 'simple'],
      [StepType.SCRIPT, 'groovy'],
      [StepType.SINK, 'log'],
      [StepType.ERROR, 'log'],
    ];
    Object.assign(component, {
      viewMode: 'design',
      testView: 'flow',
      testPanelTab: 'test',
      scriptTab: 'scripts',
      sidePanelCollapsed: true,
      selection: { type: 'flow' },
      flow: { id: 7 },
      activeEditor: 'script',
      steps: types.map(([stepType], i) => new Step(i + 1, stepType)),
      stepsToDelete: [],
      numberOfSteps: 5,
      stepsOptions: [['s'], ['a'], ['b'], ['l'], ['e']],
      componentOptions: [],
      selectedOptions: [],
      enableConnection: [false, true, false, false, false],
      enableMessage: [],
      filterConnection: [],
      connectionType: [],
      uriPlaceholders: [],
      uriPopoverMessages: [],
      URIList: [],
      componentTypeCamelLinks: [],
      editFlowForm: new FormGroup({ stepsData: new FormArray(types.map(([stepType, componentType], i) => stepForm(i + 1, stepType, componentType))) }),
      cdr: { markForCheck: jest.fn(), detectChanges: jest.fn() },
      router: { parseUrl: (path: string) => serializer.parse(path), serializeUrl: (tree: UrlTree) => serializer.serialize(tree) },
      location: { path: () => url, replaceState: (next: string) => (url = next) },
    });
    return { component, url: () => url };
  }

  const stepRun = (stepId: string, status: 'completed' | 'failed') => ({
    stepId,
    status,
    startedAt: '2026-10-24T10:00:00Z',
    ownMillis: 2,
    totalMillis: 5,
    in: { body: '', headers: {}, truncated: false },
    out: status === 'completed' ? { body: 'Hello', headers: {}, truncated: false } : null,
    error: status === 'failed' ? 'No such property: x' : null,
  });

  it('moves a Script among the Scripts, with everything it has at its place, and the test message follows the first one', () => {
    const { component } = editor();
    expect(component.scriptEntryStepId).toBe('2');

    component.moveScript(1, 0);

    expect(component.steps.map(step => step.id)).toEqual([1, 3, 2, 4, 5]);
    expect(component.enableConnection).toEqual([false, false, true, false, false]);
    expect(component.scriptLanguage(1)).toBe('Groovy');
    expect(component.scriptEntryStepId).toBe('3');
    expect(component.editFlowForm.dirty).toBe(true);
  });

  it('lets a Script be moved and removed while the Flow has another', () => {
    const { component } = editor();
    expect([1, 2, 3, 4].map(index => component.isMovableListStep(index))).toEqual([true, true, false, false]);

    component.removeStep(component.steps[1], 1);

    expect(component.scriptIndices).toEqual([1]);
    expect(component.isMovableListStep(1)).toBe(false);
  });

  it('shows the Source and the Log of the result on their own tab', () => {
    const { component } = editor();

    expect(component.scriptEndIndices).toEqual([0, 3]);
    expect(component.hasResultStep).toBe(true);
  });

  it('opens the tab of the first Step that needs attention after a failed save', () => {
    const { component } = editor();
    const stepsData = component.editFlowForm.controls.stepsData as FormArray;

    stepsData.at(3).setErrors({ required: true });
    (component as any).showInvalidCodeTab();
    expect(component.scriptTab).toBe('source');

    stepsData.at(3).setErrors(null);
    stepsData.at(4).setErrors({ required: true });
    (component as any).showInvalidCodeTab();
    expect(component.scriptTab).toBe('errorHandler');
  });

  it('shows what each Script made of the test message, and which ones it never reached', () => {
    const { component } = editor();

    component.onTestRan({ runId: 'r', status: 'failed', durationMillis: 4, response: null, steps: [stepRun('2', 'failed')] });

    expect(component.scriptRun(1)?.error).toBe('No such property: x');
    expect(component.scriptUnreached(1)).toBe(false);
    expect(component.scriptRun(2)).toBeUndefined();
    expect(component.scriptUnreached(2)).toBe(true);
  });

  it('has a Code and a Test mode, kept in the URL, and forgets the last run once the Scripts are saved', () => {
    const { component, url } = editor();
    component.setMode('test');

    expect(component.viewMode).toBe('test');
    expect(component.testTabs.map(tab => tab.label)).toEqual(['Scripts', 'Log', 'Camel route']);
    expect(url()).toBe('/flow/editor/7?mode=edit&editor=script&id=7&view=test');

    component.onTestRan({ runId: 'r', status: 'completed', durationMillis: 4, response: null, steps: [stepRun('2', 'completed')] });
    const restart = jest.fn();
    Object.assign(component, {
      afterSaveAction: 'restart',
      header: { restart },
      load: jest.fn(),
      router: { ...(component as any).router, createUrlTree: () => serializer.parse('/flow/editor/7?mode=edit&editor=script&id=7&view=test') },
    });
    (component as any).afterSave();

    expect(restart).toHaveBeenCalledWith(7);
    expect(component.viewMode).toBe('test');
    expect(component.testRun).toBeUndefined();
    expect(component.scriptRun(1)).toBeUndefined();
  });
});

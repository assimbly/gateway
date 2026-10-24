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

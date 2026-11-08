import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { DefaultUrlSerializer, UrlTree } from '@angular/router';
import { Subject } from 'rxjs';

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
      designTab: 'flow',
      testView: 'flow',
      sidePanelCollapsed: true,
      tabLayout: 'full',
      selection: { type: 'flow' },
      canvasProblems: [],
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

  it('tests the saved Flow on the Visual flow without the side panel, and keeps the mode in the URL without loading the Flow again', () => {
    const { component, url } = editor();

    component.setMode('test');

    expect(component.viewMode).toBe('test');
    expect(component.testView).toBe('flow');
    expect(component.sidePanelShown).toBe(false);
    expect(url()).toBe('/flow/editor/7?mode=edit&editor=flow&id=7&view=test');
    expect((component as any).router.navigate).not.toHaveBeenCalled();

    component.setMode('design');

    expect(component.viewMode).toBe('design');
    expect(url()).toBe('/flow/editor/7?mode=edit&editor=flow&id=7');
  });

  it('opens Test on the Tester tab with the Test button, and shows a clicked Step beside the Visual flow', () => {
    const { component } = editor();

    component.openTest();

    expect(component.viewMode).toBe('test');
    expect(component.activeTab).toBe('tester');
    expect(component.canvasShown).toBe(false);
    expect(component.toolbarTabs.map(tab => tab.label)).toEqual(['Visual flow', 'Tester', 'Stats', 'Log', 'Camel route']);

    component.showTab('flow');
    component.onSelectionChange({ type: 'step', key: 's1' });

    expect(component.sidePanelShown).toBe(true);
  });

  describe('tab layout', () => {
    const shows = (component: FlowEditorEsbComponent) => ({ canvas: component.canvasShown, tab: component.tabShown });

    it('shows a tab full page, beside the canvas, or not at all, with < and >', () => {
      const { component } = editor();
      component.showTab('settings');
      expect(shows(component)).toEqual({ canvas: false, tab: true });

      component.tabToRight();
      expect(component.tabLayout).toBe('panel');
      expect(shows(component)).toEqual({ canvas: true, tab: true });

      component.tabToRight();
      expect(component.tabLayout).toBe('closed');
      expect(shows(component)).toEqual({ canvas: true, tab: false });

      component.tabToLeft();
      expect(component.tabLayout).toBe('panel');

      component.tabToLeft();
      expect(component.tabLayout).toBe('full');
      expect(shows(component)).toEqual({ canvas: false, tab: true });
    });

    it('keeps the layout for every tab, also in Test, and shows only the canvas on the Visual flow', () => {
      const { component } = editor();
      component.showTab('notes');
      component.tabToRight();

      component.showTab('editor');
      expect(shows(component)).toEqual({ canvas: true, tab: true });

      component.setMode('test');
      component.showTab('stats');
      expect(component.tabLayout).toBe('panel');
      expect(shows(component)).toEqual({ canvas: true, tab: true });

      component.showTab('flow');
      expect(shows(component)).toEqual({ canvas: true, tab: false });
    });

    it('opens another tab in the panel while the panel is closed', () => {
      const { component } = editor();
      component.showTab('settings');
      component.tabToRight();
      component.tabToRight();

      component.showTab('notes');

      expect(component.tabLayout).toBe('panel');
      expect(shows(component)).toEqual({ canvas: true, tab: true });
    });

    it('opens the Tester in the panel with the Test button while the panel is closed', () => {
      const { component } = editor();
      component.showTab('notes');
      component.tabToRight();
      component.tabToRight();

      component.openTest();

      expect(component.activeTab).toBe('tester');
      expect(component.tabLayout).toBe('panel');
    });
  });

  describe('Design tabs', () => {
    it('shows the side panel while a Step, Steps or a Branch is selected, and hides it on a click on the empty canvas', () => {
      const { component } = editor();

      expect(component.sidePanelShown).toBe(false);

      component.onSelectionChange({ type: 'step', key: 's1' });
      expect(component.sidePanelShown).toBe(true);

      component.onSelectionChange({ type: 'link', to: 's2' });
      expect(component.sidePanelShown).toBe(true);

      component.onSelectionChange({ type: 'flow' });
      expect(component.sidePanelShown).toBe(false);
    });

    it('closes the side panel with its close button, and keeps the Step selected', () => {
      const { component } = editor();
      component.onSelectionChange({ type: 'step', key: 's1' });

      component.closePanel();

      expect(component.sidePanelShown).toBe(false);
      expect(component.selection).toEqual({ type: 'step', key: 's1' });
    });

    it('shows no side panel on the other tabs, and hides the canvas behind them', () => {
      const { component } = editor();
      component.onSelectionChange({ type: 'step', key: 's1' });

      component.showTab('settings');

      expect(component.designTab).toBe('settings');
      expect(component.activeTab).toBe('settings');
      expect(component.sidePanelShown).toBe(false);
      expect(component.canvasShown).toBe(false);
      expect(component.toolbarTabs.map(tab => tab.label)).toEqual(['Visual flow', 'Editor', 'Error handler', 'Settings', 'Notes']);
    });

    it('shows the Step clicked on the Visual flow full page on the Editor tab with <', () => {
      const { component } = editor();
      component.showTab('notes');
      component.tabToRight();
      component.showTab('flow');
      component.onSelectionChange({ type: 'step', key: 's1' });

      component.showSelectionFullPage();

      expect(component.activeTab).toBe('editor');
      expect(component.tabLayout).toBe('full');
      expect({ canvas: component.canvasShown, tab: component.tabShown }).toEqual({ canvas: false, tab: true });
      expect(component.selection).toEqual({ type: 'step', key: 's1' });
    });

    it('opens a double-clicked Step on the Editor tab', () => {
      const { component } = editor();

      component.openStepEditor('s1');

      expect(component.designTab).toBe('editor');
      expect(component.selection).toEqual({ type: 'step', key: 's1' });
    });

    it('opens a Step double-clicked in Test beside the Visual flow in Design', () => {
      const { component } = editor();
      component.showDesignTab('notes');
      component.setMode('test');

      component.openStepEditor('s1');

      expect(component.viewMode).toBe('design');
      expect(component.designTab).toBe('flow');
      expect(component.sidePanelShown).toBe(true);
    });
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

  describe('with several Steps', () => {
    function designing(): FlowEditorEsbComponent {
      const { component } = editor();
      Object.assign(component, {
        designer: {},
        modalService: { hasOpenModals: () => false },
        offcanvas: { hasOpenOffcanvas: () => false },
      });
      return component;
    }

    it('selects every Step with Ctrl+A, without selecting the page text', () => {
      const component = designing();
      const selectAllSteps = jest.fn();
      Object.assign(component, { flowCanvas: { selectAllSteps } });
      const event = new KeyboardEvent('keydown', { key: 'a', ctrlKey: true, cancelable: true });

      component.onDesignerKeydown(event);

      expect(selectAllSteps).toHaveBeenCalled();
      expect(event.defaultPrevented).toBe(true);
    });

    it('deletes all selected Steps with the Delete key', () => {
      const component = designing();
      component.selection = { type: 'steps', keys: ['s1', 's2'] };
      const deleteSteps = jest.spyOn(component, 'onDeleteSteps').mockImplementation(() => undefined);

      component.onDesignerKeydown(new KeyboardEvent('keydown', { key: 'Delete' }));

      expect(deleteSteps).toHaveBeenCalledWith(['s1', 's2']);
    });
  });

  describe('saving before leaving', () => {
    function saving(): FlowEditorEsbComponent {
      const { component } = editor();
      Object.assign(component, { saving: false, saveFinished: new Subject<boolean>(), savingFlowSuccess: false });
      return component;
    }

    it('tells that the Flow was saved once the save is over', async () => {
      const component = saving();
      jest.spyOn(component, 'save').mockImplementation(() => {
        component.isSaving = true;
        setTimeout(() => {
          component.savingFlowSuccess = true;
          component.isSaving = false;
        });
      });

      expect(await component.saveBeforeLeaving()).toBe(true);
    });

    it('tells that it was not saved when the save failed', async () => {
      const component = saving();
      jest.spyOn(component, 'save').mockImplementation(() => {
        component.isSaving = true;
        setTimeout(() => (component.isSaving = false));
      });

      expect(await component.saveBeforeLeaving()).toBe(false);
    });

    it('tells that it was not saved when the Flow could not be saved, such as with an empty field', async () => {
      const component = saving();
      jest.spyOn(component, 'save').mockImplementation(() => undefined);

      expect(await component.saveBeforeLeaving()).toBe(false);
    });
  });

  it('goes back to Design to edit a Step from Test', () => {
    const { component } = editor();
    component.setMode('test');

    component.editStepFromTest('s1');

    expect(component.viewMode).toBe('design');
    expect(component.selection).toEqual({ type: 'step', key: 's1' });
  });

  it('selects a problem of the Draft list in Design, with the panel open and its Step in view', () => {
    const { component } = editor();
    const reveal = jest.fn();
    Object.assign(component, { flowCanvas: { reveal, keepInView: jest.fn() } });
    component.setMode('test');

    component.onProblemSelected({ where: 'Sink · file', message: 'Fill in the Directory Name in the path.', selection: { type: 'step', key: 's3' } });

    expect(component.viewMode).toBe('design');
    expect(component.selection).toEqual({ type: 'step', key: 's3' });
    expect(component.sidePanelCollapsed).toBe(false);
    expect(reveal).toHaveBeenCalledWith('s3');
  });

  it('does not test a Draft', () => {
    const { component, url } = editor();
    component.canvasProblems = [{ stepKey: 's2', message: 'Choose a component for this Step.' }];

    component.setMode('test');

    expect(component.viewMode).toBe('design');
    expect(url()).not.toContain('view=test');
  });

  it('opens a Draft opened in Test in Design instead, with the first thing to finish selected', () => {
    const { component, url } = editor();
    component.setMode('test');
    Object.assign(component, {
      flowCanvas: { reveal: jest.fn(), keepInView: jest.fn() },
      schemas: { pathRule: () => undefined },
      canvasGraph: {
        steps: [
          { key: 's1', kind: 'SOURCE', componentType: 'file', uri: 'in' },
          { key: 's2', kind: 'SINK' },
        ],
        links: [{ from: 's1', to: 's2', transport: 'sync' }],
      },
    });

    (component as any).checkCanvas();

    expect(component.viewMode).toBe('design');
    expect(url()).not.toContain('view=test');
    expect(component.selection).toEqual({ type: 'step', key: 's2' });
    expect(component.draftProblems).toEqual([{ where: 'Sink', message: 'Choose a component for this Step.', selection: { type: 'step', key: 's2' } }]);
  });

  it('switches to Test once Save & Test saved the Flow', () => {
    const { component, url } = editor();
    const start = jest.fn();
    Object.assign(component, { afterSaveAction: 'start', designer: {}, header: { start }, refreshCanvas: jest.fn() });

    (component as any).afterSave();

    expect(start).toHaveBeenCalledWith(7);
    expect(component.viewMode).toBe('test');
    expect(component.testView).toBe('tester');
    expect(url()).toContain('view=test');
  });
});

describe('Flow editor canvas', () => {
  /** The visual editor with a Source and a Sink whose graph still has the ids `graphIds`, and whose Steps have `stepIds`. */
  function editor(graphIds: (number | undefined)[], stepIds: (number | null)[]): FlowEditorEsbComponent {
    const component = Object.create(FlowEditorEsbComponent.prototype) as FlowEditorEsbComponent;
    const kinds = ['SOURCE', 'SINK'];
    Object.assign(component, {
      designer: { current: { steps: kinds.map((kind, i) => ({ key: `step-${i}`, kind, id: graphIds[i] })), links: [] } },
      stepKeys: ['step-0', 'step-1'],
      steps: stepIds.map((id, i) => new Step(id ?? undefined, kinds[i] as StepType)),
      editFlowForm: new FormGroup({
        stepsData: new FormArray(stepIds.map(id => new FormGroup({ id: new FormControl(id), componentType: new FormControl('file'), uri: new FormControl('') }))),
      }),
    });
    return component;
  }

  const idsOnCanvas = (component: FlowEditorEsbComponent): unknown[] => (component as any).syncedGraph().steps.map((step: { id?: number }) => step.id);

  it('gives the Steps on the canvas the ids a save gave them, so Test and the counts find them', () => {
    expect(idsOnCanvas(editor([undefined, undefined], [21, 22]))).toEqual([21, 22]);
  });

  it("doesn't keep the ids of the Flow a clone copies", () => {
    expect(idsOnCanvas(editor([11, 12], [null, null]))).toEqual([undefined, undefined]);
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
      sidePanelCollapsed: true,
      tabLayout: 'full',
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
    expect(component.testTabs.map(tab => tab.label)).toEqual(['Routes', 'Tester', 'Stats', 'Log', 'Camel route']);
    expect(url()).toBe('/flow/editor/7?mode=edit&editor=route&id=7&view=test');
  });

  it('shows the Error handler and the Tester beside the Routes, as the visual editor does beside its canvas', () => {
    const { component } = editor();
    expect(component.firstTab).toBe('routes');

    component.showTab('errorHandler');
    component.tabToRight();
    expect({ routes: component.canvasShown, tab: component.tabShown }).toEqual({ routes: true, tab: true });

    component.setMode('test');
    component.showTab('tester');
    expect(component.firstTab).toBe('flow');
    expect({ routes: component.canvasShown, tab: component.tabShown }).toEqual({ routes: true, tab: true });
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
      scriptTab: 'scripts',
      sidePanelCollapsed: true,
      tabLayout: 'full',
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
    expect(component.testTabs.map(tab => tab.label)).toEqual(['Scripts', 'Tester', 'Stats', 'Log', 'Camel route']);
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

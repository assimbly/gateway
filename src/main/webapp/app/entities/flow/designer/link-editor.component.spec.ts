import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IFlow } from 'app/shared/model/flow.model';
import { IStep } from 'app/shared/model/step.model';

import { loadFlowGraph } from './flow-graph';
import { LinkEditorComponent } from './link-editor.component';

const contentRouterFlow: IFlow = {
  id: 1,
  steps: [
    { id: 10, stepType: 'SOURCE', componentType: 'timer', links: [{ name: '1-11', bound: 'out' }] },
    {
      id: 11,
      stepType: 'ROUTER',
      componentType: 'content',
      links: [
        { name: '1-11', bound: 'in' },
        { name: '1-12', bound: 'out' },
        { name: '1-13', bound: 'out', rule: 'check', language: 'jsonpath', expression: '$.size', pattern: 'InOnly' },
      ],
    },
    { id: 12, stepType: 'SINK', componentType: 'log', links: [{ name: '1-12', bound: 'in' }] },
    { id: 13, stepType: 'SINK', componentType: 'log', links: [{ name: '1-13', bound: 'in' }] },
  ] as IStep[],
};

describe('Branch panel', () => {
  let fixture: ComponentFixture<LinkEditorComponent>;

  const select = (id: string) => fixture.nativeElement.querySelector(`#${id}`) as HTMLSelectElement;
  const shown = (id: string) => select(id).options[select(id).selectedIndex].textContent?.trim();
  const choices = (id: string) => [...select(id).options].map(option => option.textContent?.trim());

  beforeEach(async () => {
    TestBed.configureTestingModule({ imports: [LinkEditorComponent] });
    fixture = TestBed.createComponent(LinkEditorComponent);
    const graph = loadFlowGraph(contentRouterFlow);
    fixture.componentRef.setInput('graph', graph);
    fixture.componentRef.setInput(
      'link',
      graph.links.find(link => link.rule === 'check')!,
    );
    fixture.detectChanges();
    // ngModel writes the saved values into the selects a turn later.
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('shows the saved Condition language, transport and pattern by a readable name', () => {
    expect(shown('condition-language')).toBe('JSONPath');
    expect(shown('link-transport')).toBe('Direct');
    expect(shown('link-pattern')).toBe('Fire and forget');
    expect(choices('link-pattern')).toEqual(['Default', 'Fire and forget', 'Request and reply']);
    expect(choices('condition-language')[0]).toBe('Not set');
  });

  it('still saves the ids Camel knows, not the names shown', () => {
    const changed = jest.fn();
    fixture.componentInstance.linkChange.subscribe(changed);

    const change = (id: string, label: string) => {
      const field = select(id);
      field.selectedIndex = choices(id).indexOf(label);
      field.dispatchEvent(new Event('change'));
    };
    change('condition-language', 'Fixed value');
    change('link-transport', 'Through a queue');
    change('link-pattern', 'Request and reply');

    expect(changed.mock.calls.map(call => call[0])).toEqual([{ language: 'constant' }, { transport: 'async' }, { pattern: 'InOut' }]);
  });
});

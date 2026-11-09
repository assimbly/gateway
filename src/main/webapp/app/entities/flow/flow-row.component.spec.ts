import { FlowRowComponent } from './flow-row.component';

describe('Flow row', () => {
  /** A row of a saved visual Flow, without rendering it. */
  function row(): { component: FlowRowComponent; navigate: jest.Mock } {
    const component = Object.create(FlowRowComponent.prototype) as FlowRowComponent;
    const navigate = jest.fn();
    Object.assign(component, { flow: { id: 7, type: 'flow' }, router: { navigate } });
    return { component, navigate };
  }

  it('opens the Flow in the editor in Test with Test', () => {
    const { component, navigate } = row();

    component.navigateToFlowEditor('test');

    expect(navigate).toHaveBeenCalledWith(['../../flow/editor', 7], { queryParams: { mode: 'edit', editor: 'flow', id: 7, view: 'test' } });
  });

  it('opens the Flow in the editor in Design with Edit', () => {
    const { component, navigate } = row();

    component.navigateToFlowEditor('edit');

    expect(navigate).toHaveBeenCalledWith(['../../flow/editor', 7], { queryParams: { mode: 'edit', editor: 'flow', id: 7 } });
  });
});

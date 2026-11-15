import { of } from 'rxjs';

import { FlowRowComponent } from './flow-row.component';

describe('Flow row', () => {
  /** A row of a saved visual Flow, without rendering it. */
  function row(): { component: FlowRowComponent; navigate: jest.Mock } {
    const component = Object.create(FlowRowComponent.prototype) as FlowRowComponent;
    const navigate = jest.fn();
    Object.assign(component, { flow: () => ({ id: 7, type: 'flow' }), router: { navigate } });
    return { component, navigate };
  }

  /** A row that shows this status, whose status readings answer with `reported`. */
  function polling(shown: string, reported: string) {
    const { component } = row();
    const setFlowStatus = jest.fn();
    const subscriptions = { add: jest.fn() };
    Object.assign(component, {
      statusFlow: shown,
      disableActionBtns: false,
      destroyed: false,
      subscriptions,
      setFlowStatus,
      flowService: { getFlowStatus: jest.fn(() => of({ body: reported })) },
    });
    return { component, setFlowStatus };
  }

  it('shows the status in words, and what it is doing while an action runs', () => {
    const { component } = row();
    Object.assign(component, { statusFlow: 'inactive', isDraft: false, disableActionBtns: false, flowStatus: 'unconfigured' });
    expect(component.statusLabel).toBe('Stopped');

    Object.assign(component, { disableActionBtns: true, flowStatus: 'Starting' });
    expect(component.statusLabel).toBe('Starting…');
  });

  it('takes the status of a Flow that was started elsewhere when it reads it again', () => {
    const { component, setFlowStatus } = polling('inactive', 'started');

    component.pollStatus();

    expect(setFlowStatus).toHaveBeenCalledWith('started');
  });

  it('leaves the row as it is when the status has not changed, or while an action of the row runs', () => {
    const same = polling('active', 'started');
    same.component.pollStatus();
    expect(same.setFlowStatus).not.toHaveBeenCalled();

    const busy = polling('inactive', 'started');
    busy.component.disableActionBtns = true;
    busy.component.pollStatus();
    expect(busy.setFlowStatus).not.toHaveBeenCalled();
  });

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

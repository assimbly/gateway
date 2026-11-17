import { ChangeDetectorRef } from '@angular/core';

import { FlowStatsPageComponent } from './flow-stats-page.component';

describe('Flow stats page', () => {
  function page(): FlowStatsPageComponent {
    return Object.assign(Object.create(FlowStatsPageComponent.prototype) as FlowStatsPageComponent, {
      cdr: { markForCheck: jest.fn() } as unknown as ChangeDetectorRef,
    });
  }

  it.each([
    ['active', 'Running', 'text-bg-success'],
    ['paused', 'Paused', 'text-bg-warning'],
    ['inactive', 'Stopped', 'text-bg-secondary'],
  ] as const)('names a Flow that is %s as the Flows list does', (status, label, badge) => {
    const component = page();

    component.onStatusChange(status);

    expect(component.read).toBe(true);
    expect(component.statusLabel).toBe(label);
    expect(component.statusBadge).toBe(badge);
    expect(component.running).toBe(status === 'active');
  });
});

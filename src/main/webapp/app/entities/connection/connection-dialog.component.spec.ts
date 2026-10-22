import { of } from 'rxjs';

import { Connection } from 'app/shared/model/connection.model';
import { ConnectionKeys } from 'app/shared/model/connection-keys.model';
import { Connections } from 'app/shared/camel/connections';

import { ConnectionDialogComponent } from './connection-dialog.component';

describe('ConnectionDialogComponent', () => {
  function open(connection: Connection, savedKeys: ConnectionKeys[] = []): ConnectionDialogComponent {
    const component = new ConnectionDialogComponent(
      {} as any,
      { query: () => of({ body: [] }) } as any,
      { query: () => of({ body: savedKeys }) } as any,
      new Connections(),
      {} as any,
      {} as any,
      { fragment: { value: null } } as any,
      {} as any,
      { markForCheck: jest.fn() } as any,
    );
    component.connection = connection;
    component.ngOnInit();
    return component;
  }

  function value(component: ConnectionDialogComponent, key: string): string | undefined {
    return component.connectionKeys.find(connectionKey => connectionKey.key === key)?.value;
  }

  it('starts a new SJMS connection pooled', () => {
    expect(value(open(new Connection(undefined, undefined, 'SJMS')), 'pooled')).toBe('true');
  });

  it('keeps the pooled value of a saved connection', () => {
    const pooled = Object.assign(new ConnectionKeys(), { id: 3, key: 'pooled', value: 'false', connectionId: 7 });
    expect(value(open(new Connection(7, 'LocalBroker', 'SJMS'), [pooled]), 'pooled')).toBe('false');
  });
});

import { ChangeDetectorRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { of } from 'rxjs';

import { AlertService } from 'app/core/util/alert.service';
import { EventManager } from 'app/core/util/event-manager.service';
import { Connection } from 'app/shared/model/connection.model';
import { ConnectionKeys } from 'app/shared/model/connection-keys.model';
import { Connections } from 'app/shared/camel/connections';

import { ConnectionKeysService } from '../connection-keys/connection-keys.service';
import { ConnectionDialogComponent } from './connection-dialog.component';
import { ConnectionService } from './connection.service';

describe('ConnectionDialogComponent', () => {
  function open(connection: Connection, savedKeys: ConnectionKeys[] = []): ConnectionDialogComponent {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        { provide: NgbActiveModal, useValue: {} },
        { provide: ConnectionService, useValue: { query: () => of({ body: [] }) } },
        { provide: ConnectionKeysService, useValue: { query: () => of({ body: savedKeys }) } },
        { provide: Connections, useValue: new Connections() },
        { provide: EventManager, useValue: {} },
        { provide: AlertService, useValue: {} },
        { provide: ActivatedRoute, useValue: { snapshot: { fragment: null } } },
        { provide: Router, useValue: {} },
        { provide: ChangeDetectorRef, useValue: { markForCheck: jest.fn() } },
      ],
    });
    const component = TestBed.runInInjectionContext(() => new ConnectionDialogComponent());
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

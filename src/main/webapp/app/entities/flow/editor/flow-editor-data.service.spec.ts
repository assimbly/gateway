import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';

import { ApiService } from 'app/entities/api/api.service';

import { ConnectionService } from '../../connection/connection.service';
import { IntegrationService } from '../../integration/integration.service';
import { MessageService } from '../../message/message.service';
import { RouteService } from '../../route/route.service';
import { StepService } from '../../step/step.service';
import { FlowService } from '../flow.service';

import { FlowEditorDataService } from './flow-editor-data.service';

describe('FlowEditorDataService', () => {
  const body = <T>(value: T) => of({ body: value });
  const flowService = {
    getWikiDocUrl: jest.fn(() => body('https://wiki')),
    getCamelDocUrl: jest.fn(() => body('https://camel')),
    getIntegrationName: jest.fn(() => body('default')),
    find: jest.fn((id: number) => body({ id, name: 'Orders' })),
    query: jest.fn(() => body([{ id: 7 }, { id: 8 }])),
  };
  const apiService = { handlerOf: jest.fn(() => of({ apiId: 1 })) };
  let service: FlowEditorDataService;

  beforeEach(() => {
    jest.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [
        { provide: FlowService, useValue: flowService },
        { provide: ApiService, useValue: apiService },
        { provide: MessageService, useValue: { getAllMessages: () => body([{ id: 1 }]) } },
        { provide: RouteService, useValue: { getAllRoutes: () => body([]) } },
        { provide: ConnectionService, useValue: { getAllConnections: () => body([{ id: 2 }]) } },
        { provide: IntegrationService, useValue: { query: () => body([{ id: 3, name: 'default' }]) } },
        { provide: StepService, useValue: { query: () => body([{ id: 4 }]) } },
      ],
    });
    service = TestBed.inject(FlowEditorDataService);
  });

  it('loads the reference data only for a new Flow', async () => {
    const data = await firstValueFrom(service.load());

    expect(data.reference).toEqual({
      wikiDocUrl: 'https://wiki',
      camelDocUrl: 'https://camel',
      messages: [{ id: 1 }],
      routes: [],
      connections: [{ id: 2 }],
      integrations: [{ id: 3, name: 'default' }],
      allsteps: [{ id: 4 }],
      integrationName: 'default',
    });
    expect(data.opened).toBeUndefined();
    expect(flowService.find).not.toHaveBeenCalled();
    expect(apiService.handlerOf).not.toHaveBeenCalled();
  });

  it('loads a saved Flow with the Operation it handles and the Flows it can call', async () => {
    const data = await firstValueFrom(service.load(7));

    expect(flowService.find).toHaveBeenCalledWith(7);
    expect(apiService.handlerOf).toHaveBeenCalledWith(7);
    expect(data.reference.integrationName).toBe('default');
    expect(data.opened).toEqual({ flow: { id: 7, name: 'Orders' }, handler: { apiId: 1 }, flows: [{ id: 7 }, { id: 8 }] });
  });
});

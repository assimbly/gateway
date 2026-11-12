import { Service, inject } from '@angular/core';
import { Observable, forkJoin, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { IApiHandler } from 'app/entities/api/api.model';
import { ApiService } from 'app/entities/api/api.service';
import { IConnection } from 'app/shared/model/connection.model';
import { IFlow } from 'app/shared/model/flow.model';
import { IIntegration } from 'app/shared/model/integration.model';
import { IMessage } from 'app/shared/model/message.model';
import { IRoute } from 'app/shared/model/route.model';
import { IStep } from 'app/shared/model/step.model';

import { ConnectionService } from '../../connection/connection.service';
import { IntegrationService } from '../../integration/integration.service';
import { MessageService } from '../../message/message.service';
import { RouteService } from '../../route/route.service';
import { StepService } from '../../step/step.service';
import { FlowService } from '../flow.service';

/** What the editor offers in every Flow: what a Step can use, and where its documentation is. */
export interface EditorReferenceData {
  wikiDocUrl: string;
  camelDocUrl: string;
  messages: IMessage[];
  routes: IRoute[];
  connections: IConnection[];
  integrations: IIntegration[];
  allsteps: IStep[];
  integrationName: string;
}

/** A saved Flow as the editor opens it: with the API Operation it handles, and the Flows it can call. */
export interface OpenedFlow {
  flow: IFlow;
  handler?: IApiHandler;
  flows: IFlow[];
}

export interface FlowEditorData {
  reference: EditorReferenceData;
  /** Absent for a new Flow. */
  opened?: OpenedFlow;
}

/** Loads what the Flow editor needs before it can show a Flow. */
@Service()
export class FlowEditorDataService {
  private readonly flowService = inject(FlowService);
  private readonly apiService = inject(ApiService);
  private readonly messageService = inject(MessageService);
  private readonly routeService = inject(RouteService);
  private readonly connectionService = inject(ConnectionService);
  private readonly integrationService = inject(IntegrationService);
  private readonly stepService = inject(StepService);

  /** The reference data, and the Flow with this id when there is one. */
  load(id?: number): Observable<FlowEditorData> {
    return this.reference().pipe(
      switchMap(reference => (id ? this.open(id).pipe(map(opened => ({ reference, opened }))) : of({ reference }))),
    );
  }

  private reference(): Observable<EditorReferenceData> {
    return forkJoin({
      wikiDocUrl: this.flowService.getWikiDocUrl(),
      camelDocUrl: this.flowService.getCamelDocUrl(),
      messages: this.messageService.getAllMessages(),
      routes: this.routeService.getAllRoutes(),
      connections: this.connectionService.getAllConnections(),
      integrations: this.integrationService.query(),
      allsteps: this.stepService.query(),
      integrationName: this.flowService.getIntegrationName(),
    }).pipe(
      map(responses => ({
        wikiDocUrl: responses.wikiDocUrl.body,
        camelDocUrl: responses.camelDocUrl.body,
        messages: responses.messages.body,
        routes: responses.routes.body,
        connections: responses.connections.body,
        integrations: responses.integrations.body,
        allsteps: responses.allsteps.body,
        integrationName: responses.integrationName.body,
      })),
    );
  }

  private open(id: number): Observable<OpenedFlow> {
    return forkJoin({
      flow: this.flowService.find(id),
      handler: this.apiService.handlerOf(id),
      flows: this.flowService.query({ page: 0, size: 1000 }),
    }).pipe(map(({ flow, handler, flows }) => ({ flow: flow.body, handler, flows: flows.body ?? [] })));
  }
}

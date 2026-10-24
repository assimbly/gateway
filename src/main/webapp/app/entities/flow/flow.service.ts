import { Service, inject } from '@angular/core';
import { HttpClient, HttpContext, HttpResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { MonoTypeOperatorFunction, Observable, Observer, Subscription, catchError, from, map, of, pipe, switchMap, throwError } from 'rxjs';

import { serverApiUrl } from 'app/config';

import { createRequestOption } from 'app/shared/util/request-util';

import { Router } from '@angular/router';
import { WindowRef } from 'app/shared/window/window.service';
import { saveAs } from 'file-saver/FileSaver';
import { IIntegration } from 'app/shared/model/integration.model';
import { IFlow, Flow, LogLevelType } from 'app/shared/model/flow.model';
import { traceCollector } from 'app/shared/collect/collectors';
import { HANDLES_OWN_ERRORS } from 'app/core/interceptor/error-handler.interceptor';
import { ScriptTrial, scriptTrialError, scriptTrialRequest, scriptTrialResult } from './editor/script-flow';
import { FlowTestRun, TestRunRequest } from './test/flow-test-run';
import { FlowVerb, failureLines } from './flow-alerts';
import { FlowFailure, failureOfError, flowFailureOf } from './flow-status';

/** Message counts of a Flow, as transactions (once per message) or exchanges (once per step). */
export interface IFlowCounts {
  total: number;
  completed: number;
  failed: number;
  pending: number;
}

/** The Flow's full stats: transactions count each message once, exchanges count it once per step. */
export interface IFlowStats {
  id: string;
  status?: string;
  uptimeMillis?: number;
  lastCompleted?: number;
  lastFailed?: number;
  meanProcessingTime?: number;
  maxProcessingTime?: number;
  lastProcessingTime?: number;
  transactionsTotal: number;
  transactionsCompleted: number;
  transactionsFailed: number;
  transactionsPending: number;
  exchangesTotal: number;
  exchangesCompleted: number;
  exchangesFailed: number;
  exchangesPending: number;
}

/** The exchanges of one Step; `id` is the Step's runtime route id without the Flow id in front. */
export interface IStepCounts extends IFlowCounts {
  id: string;
}

/** The runtime's stats of one Step, as far as they are shown; the counters are Camel's own. */
export interface IStepStats {
  id: string;
  status?: string;
  stats?: {
    meanProcessingTime?: number;
    maxProcessingTime?: number;
    lastProcessingTime?: number;
  };
}

type EntityResponseType = HttpResponse<IFlow>;
type EntityArrayResponseType = HttpResponse<IFlow[]>;

/** Configuring, starting, stopping, pausing or resuming a Flow shows its own errors: the Flows list and the editor explain them. */
const OWN_ERRORS = new HttpContext().set(HANDLES_OWN_ERRORS, true);

@Service()
export class FlowService {
  protected http = inject(HttpClient);
  protected router = inject(Router);
  protected $window = inject(WindowRef);

  public resourceUrl = `${serverApiUrl}api/flows`;
  public integrationUrl = `${serverApiUrl}api/integration`;
  public validationUrl = `${serverApiUrl}api/validation`;
  public environmentUrl = `${serverApiUrl}api/environment`;

  create(flow: IFlow): Observable<EntityResponseType> {
    return this.http.post<IFlow>(this.resourceUrl, flow, { observe: 'response' });
  }

  update(flow: IFlow): Observable<EntityResponseType> {
    return this.http.put<IFlow>(this.resourceUrl, flow, { observe: 'response' });
  }

  find(flowId: number): Observable<EntityResponseType> {
    return this.http.get<IFlow>(`${this.resourceUrl}/${flowId}`, { observe: 'response' });
  }

  /** The Flow with this name, or a 404 when there is none. With ignoreCase, "Testflow" is found for "TestFlow" too. */
  findByName(name: string, context?: HttpContext, ignoreCase = false): Observable<EntityResponseType> {
    let params = new HttpParams().set('name', name);
    if (ignoreCase) {
      params = params.set('ignoreCase', true);
    }
    return this.http.get<IFlow>(`${this.resourceUrl}/byname`, { params, observe: 'response', context });
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<IFlow[]>(this.resourceUrl, { params: options, observe: 'response' });
  }

  delete(flowId: number): Observable<HttpResponse<any>> {
    return this.http.delete<any>(`${this.resourceUrl}/${flowId}`, { observe: 'response' });
  }

  getFlowByIntegrationId(integrationid: Number, req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<IFlow[]>(`${this.resourceUrl}/byintegrationid/${integrationid}`, { params: options, observe: 'response' });
  }

  getConfiguration(flowid: number): Observable<HttpResponse<string>> {
    return this.http.get(`${this.environmentUrl}/1/flow/${flowid}`, {
      headers: new HttpHeaders({ PlaceholderReplacement: 'true', Accept: 'application/xml' }),
      observe: 'response',
      responseType: 'text',
    });
  }

  setConfiguration(flowId: number, xmlconfiguration: string, header?: string): Observable<HttpResponse<string>> {
    if (header) {
      return this.http.post(`${this.integrationUrl}/flow/${flowId}/configure`, xmlconfiguration, {
        headers: new HttpHeaders({ PlaceholderReplacement: 'true', Accept: 'application/xml' }),
        observe: 'response',
        responseType: 'text',
        context: OWN_ERRORS,
      });
    } else {
      return this.http.post(`${this.integrationUrl}/flow/${flowId}/configure`, xmlconfiguration, {
        observe: 'response',
        responseType: 'text',
      });
    }
  }

  /** Imports the Flow with this id from an export file; a Flow with the same name is updated, otherwise one is created. */
  importFlowConfiguration(integrationId: number, flowId: string, xmlconfiguration: string): Observable<HttpResponse<string>> {
    return this.http.post(`${this.environmentUrl}/${integrationId}/flow/${flowId}`, xmlconfiguration, {
      headers: new HttpHeaders({ Accept: 'application/xml', 'Content-Type': 'application/xml' }),
      observe: 'response',
      responseType: 'text',
    });
  }

  saveFlows(flowId: number, xmlconfiguration: string, header: string): Observable<EntityResponseType> {
    const options = {
      headers: new HttpHeaders({ Accept: 'application/xml' }),
    };
    return this.http.post<any>(`${this.environmentUrl}/flow/${flowId}`, xmlconfiguration, options);
  }

  validateFlowsUri(integrationId: number, uri: string): Observable<EntityResponseType> {
    const options = {
      headers: new HttpHeaders({ Accept: 'application/xml' }),
    };
    return this.http.get<any>(`${this.validationUrl}/uri`, options);
  }

  /** Runs a script once on a sample body in the runtime, without starting a Flow; a failure becomes the trial's error. */
  tryScript(language: string, script: string, sampleBody: string): Observable<ScriptTrial> {
    return this.http
      .post(`${this.validationUrl}/script`, scriptTrialRequest(language, script, sampleBody), {
        headers: new HttpHeaders({ Accept: 'application/json' }),
        responseType: 'text',
        context: OWN_ERRORS,
      })
      .pipe(
        map(scriptTrialResult),
        catchError(error => of(scriptTrialError(error))),
      );
  }

  /** Runs one test message through the running Flow and answers what each Step did; a failure is for the caller to show. */
  testRun(flowId: number, request: TestRunRequest): Observable<FlowTestRun> {
    return this.http.post<FlowTestRun>(`${this.resourceUrl}/${flowId}/test-runs`, request, { context: OWN_ERRORS });
  }

  /** Sends the Flow's saved configuration to the runtime, then starts it. A failure is for the caller to show. */
  configureAndStart(flowId: number): Observable<HttpResponse<string>> {
    return this.configure(flowId).pipe(
      switchMap(() => this.applyTrace(flowId)),
      switchMap(() => this.start(flowId)),
    );
  }

  /** Sends the Flow's saved configuration to the runtime, to start it next; a failure is kept as an Alert. */
  configure(flowId: number): Observable<unknown> {
    return this.getConfiguration(flowId).pipe(
      switchMap(configuration => this.setConfiguration(flowId, configuration.body, 'true')),
      catchError(error => this.recordFailure(flowId, 'configure', errorFailure(error)).pipe(switchMap(() => throwError(() => error)))),
    );
  }

  /** The Camel routes the runtime built for a loaded Flow, as Camel XML; `0` when the Flow isn't loaded. */
  getCamelRoute(flowId: number): Observable<HttpResponse<string>> {
    return this.http.get(`${this.integrationUrl}/flow/${flowId}/route`, {
      headers: new HttpHeaders({ Accept: 'application/xml' }),
      observe: 'response',
      responseType: 'text',
      context: OWN_ERRORS,
    });
  }

  /** Stops the running Flow and starts it with its saved configuration, so a change made while it ran takes effect. */
  configureAndRestart(flowId: number): Observable<HttpResponse<string>> {
    return this.stop(flowId).pipe(switchMap(() => this.configureAndStart(flowId)));
  }

  /**
   * Makes the runtime trace the Flow, or stop tracing it, as its Trace setting says. Tracing writes the message after each
   * Step to the log. Not being able to trace never keeps a Flow from starting.
   */
  applyTrace(flowId: number): Observable<unknown> {
    return this.find(flowId).pipe(
      switchMap(response =>
        response.body?.logLevel === LogLevelType.TRACE
          ? this.http.post(`${this.integrationUrl}/collector/${flowId}/add`, traceCollector(response.body), { responseType: 'text' })
          : this.http.delete(`${this.integrationUrl}/collector/${flowId}/remove`, { responseType: 'text' }),
      ),
      catchError(() => of(null)),
    );
  }

  start(flowId: number): Observable<HttpResponse<string>> {
    return this.http
      .get(`${this.integrationUrl}/flow/${flowId}/start`, { observe: 'response', responseType: 'text', context: OWN_ERRORS })
      .pipe(this.recordingFailures(flowId, 'start'));
  }

  pause(flowId: number): Observable<HttpResponse<string>> {
    return this.http
      .get(`${this.integrationUrl}/flow/${flowId}/pause`, { observe: 'response', responseType: 'text', context: OWN_ERRORS })
      .pipe(this.recordingFailures(flowId, 'pause'));
  }

  resume(flowId: number): Observable<HttpResponse<string>> {
    return this.http
      .get(`${this.integrationUrl}/flow/${flowId}/resume`, { observe: 'response', responseType: 'text', context: OWN_ERRORS })
      .pipe(this.recordingFailures(flowId, 'resume'));
  }

  restart(flowId: number): Observable<HttpResponse<string>> {
    return this.http
      .get(`${this.integrationUrl}/flow/${flowId}/restart`, { observe: 'response', responseType: 'text', context: OWN_ERRORS })
      .pipe(this.recordingFailures(flowId, 'restart'));
  }

  stop(flowId: number): Observable<HttpResponse<string>> {
    return this.http
      .get(`${this.integrationUrl}/flow/${flowId}/stop`, { observe: 'response', responseType: 'text', context: OWN_ERRORS })
      .pipe(this.recordingFailures(flowId, 'stop'));
  }

  getFlowStatus(flowId: number, context?: HttpContext): Observable<HttpResponse<string>> {
    return this.http.get(`${this.integrationUrl}/flow/${flowId}/status`, { observe: 'response', responseType: 'text', context });
  }

  /** Transactions count each message once, however many steps it passes. */
  getFlowTransactions(flowId: number, context?: HttpContext): Observable<HttpResponse<{ flow: IFlowCounts }>> {
    return this.http.get<{ flow: IFlowCounts }>(`${this.integrationUrl}/flow/${flowId}/transactions`, {
      headers: new HttpHeaders({ Accept: 'application/json' }),
      observe: 'response',
      context,
    });
  }

  /** Adds Alerts to the Flow, one line each; the Gateway puts the time before them. */
  addFlowAlerts(flowId: number, lines: string[]): Observable<HttpResponse<void>> {
    return this.http.post<void>(`${this.resourceUrl}/${flowId}/alerts`, lines, { observe: 'response', context: OWN_ERRORS });
  }

  /**
   * Keeps why the Flow failed as an Alert, when the runtime's answer reports a failure or the call fails, and only then
   * gives the answer or the error: the caller then counts the Alert with the others. Not being able to keep it is ignored.
   */
  private recordingFailures(flowId: number, verb: FlowVerb): MonoTypeOperatorFunction<HttpResponse<string>> {
    return pipe(
      switchMap(response => {
        const failure = flowFailureOf(response.body);
        return failure ? this.recordFailure(flowId, verb, failure).pipe(map(() => response)) : of(response);
      }),
      catchError(error => this.recordFailure(flowId, verb, errorFailure(error)).pipe(switchMap(() => throwError(() => error)))),
    );
  }

  private recordFailure(flowId: number, verb: FlowVerb, failure: FlowFailure): Observable<unknown> {
    return this.addFlowAlerts(flowId, failureLines(verb, failure)).pipe(catchError(() => of(null)));
  }

  /** Clears the Flow's Alerts for everyone. */
  clearFlowAlerts(flowId: number): Observable<HttpResponse<void>> {
    return this.http.delete<void>(`${this.resourceUrl}/${flowId}/alerts`, { observe: 'response' });
  }

  getFlowAlertsPage(
    flowId: number,
    offset: number,
    limit: number,
    context?: HttpContext,
  ): Observable<HttpResponse<{ total: number; messages: string[] }>> {
    const params = new HttpParams().set('offset', offset).set('limit', limit);
    return this.http.get<{ total: number; messages: string[] }>(`${this.resourceUrl}/${flowId}/alerts`, {
      params,
      observe: 'response',
      context,
    });
  }

  getFlowAlerts(flowId: number): Observable<HttpResponse<string>> {
    return this.http.get(`${this.integrationUrl}/flow/${flowId}/alerts`, { observe: 'response', responseType: 'text' });
  }

  getFlowNumberOfAlerts(flowId: number): Observable<HttpResponse<string>> {
    return this.http.get(`${this.integrationUrl}/flow/${flowId}/alerts/count`, {
      observe: 'response',
      responseType: 'text',
    });
  }

  getFlowLastError(flowId: number): Observable<HttpResponse<string>> {
    return this.http.get(`${this.integrationUrl}/flow/${flowId}/lasterror`, {
      observe: 'response',
      responseType: 'text',
    });
  }

  getFlowStats(flowId: number): Observable<HttpResponse<{ flow: IFlowStats }>> {
    return this.http.get<{ flow: IFlowStats }>(`${this.integrationUrl}/flow/${flowId}/stats`, {
      headers: new HttpHeaders({ FullStats: 'true', Accept: 'application/json' }),
      observe: 'response',
      context: OWN_ERRORS,
    });
  }

  /** The Flow's exchanges with those of each Step. */
  getFlowExchanges(flowId: number): Observable<{ flow: IFlowCounts & { steps?: IStepCounts[] } }> {
    return this.http.get<{ flow: IFlowCounts & { steps?: IStepCounts[] } }>(`${this.integrationUrl}/flow/${flowId}/exchanges`, {
      headers: new HttpHeaders({ IncludeSteps: 'true', Accept: 'application/json' }),
      context: OWN_ERRORS,
    });
  }

  getStepStats(flowId: number, stepId: number): Observable<{ step: IStepStats }> {
    return this.http.get<{ step: IStepStats }>(`${this.integrationUrl}/flow/${flowId}/step/${stepId}/stats`, {
      headers: new HttpHeaders({ FullStats: 'true', Accept: 'application/json' }),
      context: OWN_ERRORS,
    });
  }

  getComponentOptions(componentType: String, stepType?: String): Observable<any> {
    let params = new HttpParams();
    if (stepType) {
      params = params.set('type', stepType.toString());
    }
    return this.http.get(`${this.integrationUrl}/flow/schema/` + componentType, { observe: 'response', params });
  }

  getWikiDocUrl(): Observable<HttpResponse<string>> {
    const url = `${serverApiUrl}api/wiki-url`;
    return this.http.get(url, { observe: 'response', responseType: 'text' });
  }

  getCamelDocUrl(): Observable<HttpResponse<string>> {
    const url = `${serverApiUrl}api/camel-url`;
    return this.http.get(url, { observe: 'response', responseType: 'text' });
  }

  getIntegrationName(): Observable<HttpResponse<string>> {
    const url = `${serverApiUrl}api/gateway-name`;
    return this.http.get(url, { observe: 'response', responseType: 'text' });
  }

  testConnection(integrationid: number, host: string, port: number, timeout: number): Observable<HttpResponse<string>> {
    return this.http.get(`${this.validationUrl}/connection/${host}/${port}/${timeout}`, {
      observe: 'response',
      responseType: 'text',
    });
  }

  send(
    integrationId: number,
    uri: string,
    stepId: string,
    connectionId: string,
    connectionKeys: string,
    header: string,
    numberOfTimes: string,
    messageBody: string
  ): Observable<HttpResponse<string>> {
    const options = new HttpHeaders({
      uri,
      stepId,
      connectionid: connectionId,
      connectionKeys,
      header,
      'Content-Type': 'text/plain',
      Accept: 'text/plain',
    });
    return this.http.post(`${this.integrationUrl}/send/${numberOfTimes}`, messageBody, {
      headers: options,
      observe: 'response',
      responseType: 'text',
    });
  }

  sendRequest(
    integrationId: number,
    uri: string,
    stepId: string,
    connectionId: string,
    connectionKeys: string,
    header: string,
    messageBody: string
  ): Observable<HttpResponse<string>> {
    const options = new HttpHeaders({
      uri,
      stepId,
      connectionid: connectionId,
      connectionKeys,
      header,
      'Content-Type': 'text/plain',
      Accept: 'text/plain',
    });
    return this.http.post(`${this.integrationUrl}/sendrequest`, messageBody, {
      headers: options,
      observe: 'response',
      responseType: 'text',
    });
  }

  exportIntegrationConfiguration(integration: IIntegration) {
    const url = `${this.environmentUrl}/${integration.id}`;
    const exportDate = this.getDate();

    return this.http
      .get(url, {
        headers: new HttpHeaders({
          Accept: 'application/xml',
          'Content-Type': 'application/octet-stream',
          PlaceholderReplacement: 'false',
        }),
        observe: 'response',
        responseType: 'blob',
      })
      .subscribe(
        data => {
          const blob = new Blob([data.body], { type: 'application/xml' });
          saveAs(blob, `export_integration_${integration.name}_${exportDate}.xml`);
        },
        error => console.log(error)
      );
  }

  /**
   * Downloads the Flows of the Integration as a zip for Fluxygen, one file per Flow, with their secrets encrypted with
   * the passphrase. All its Flows when `flowIds` is empty. Emits the name of the saved file; a refusal or failure comes
   * as an error whose message says why.
   */
  exportForFluxygen(integrationId: number, flowIds: number[], passphrase: string): Observable<string> {
    return this.http
      .post(
        `${this.environmentUrl}/${integrationId}/fluxygen-export`,
        { flowIds, passphrase },
        {
          headers: new HttpHeaders({ Accept: 'application/zip, text/plain' }),
          observe: 'response',
          responseType: 'blob',
          context: OWN_ERRORS,
        },
      )
      .pipe(
        map(response => {
          const fileName = attachmentName(response.headers.get('Content-Disposition')) ?? `assimbly-to-fluxygen-${this.getDate()}.zip`;
          saveAs(new Blob([response.body], { type: 'application/zip' }), fileName);
          return fileName;
        }),
        catchError(error => from(failureText(error)).pipe(switchMap(message => throwError(() => new Error(message))))),
      );
  }

  exportFlowConfiguration(flow: IFlow) {
    const url = `${this.environmentUrl}/1/flow/${flow.id}`;
    const exportDate = this.getDate();

    this.http
      .get(url, {
        headers: new HttpHeaders({
          Accept: 'application/xml',
          'Content-Type': 'application/octet-stream',
          PlaceholderReplacement: 'false',
        }),
        observe: 'response',
        responseType: 'blob',
      })
      .subscribe(
        data => {
          const blob = new Blob([data.body], { type: 'application/xml' });
          saveAs(blob, `export_flow_${flow.name}_${exportDate}.xml`);
        },
        error => console.log(error)
      );
  }


  /**
   * Convert a returned JSON object to Flow.
   */
  private convertItemFromServer(json: any): IFlow {
    const entity: IFlow = Object.assign(new Flow(), json);
    return entity;
  }

  private getDate() {
    const date = new Date();
    const year = date.getFullYear();

    let month = (1 + date.getMonth()).toString();
    month = month.length > 1 ? month : '0' + month;

    let day = date.getDate().toString();
    day = day.length > 1 ? day : '0' + day;

    return year + month + day;
  }

}

/** The file name of a `Content-Disposition: attachment; filename="…"` header, or null when it has none. */
export function attachmentName(contentDisposition: string | null): string | null {
  const match = /filename="?([^";]+)"?/i.exec(contentDisposition ?? '');
  return match ? match[1] : null;
}

/** What a failed export answered, as text: the reason the server gave, or a general message. */
/** Why a call failed: what the runtime answered, or else the HTTP error itself. */
function errorFailure(error: any): FlowFailure {
  return flowFailureOf(error?.error) ?? (error?.message ? { summary: error.message, steps: [] } : failureOfError(undefined));
}

async function failureText(error: any): Promise<string> {
  const body = error?.error;
  let text = '';
  if (body instanceof Blob) {
    text = await blobText(body);
  } else if (typeof body === 'string') {
    text = body;
  }
  return text.trim() || 'The export for Fluxygen failed.';
}

function blobText(blob: Blob): Promise<string> {
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => resolve('');
    reader.readAsText(blob);
  });
}

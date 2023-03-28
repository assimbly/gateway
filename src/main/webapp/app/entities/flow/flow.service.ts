import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpHeaders } from '@angular/common/http';
import { Observable, Observer, Subscription } from 'rxjs';

import { ApplicationConfigService } from 'app/core/config/application-config.service';

import { createRequestOption } from 'app/shared/util/request-util';

import { Router } from '@angular/router';
import { WindowRef } from 'app/shared/window/window.service';
import { saveAs } from 'file-saver/FileSaver';
import { IIntegration } from 'app/shared/model/integration.model';
import { IFlow, Flow } from 'app/shared/model/flow.model';

type EntityResponseType = HttpResponse<IFlow>;
type EntityArrayResponseType = HttpResponse<IFlow[]>;

@Injectable({ providedIn: 'root' })
export class FlowService {
  public resourceUrl = this.applicationConfigService.getEndpointFor('api/flows');
  public integrationUrl = this.applicationConfigService.getEndpointFor('api/integration');
  public validationUrl = this.applicationConfigService.getEndpointFor('api/validation');
  public environmentUrl = this.applicationConfigService.getEndpointFor('api/environment');

  private integrationid = 1;

  constructor(protected http: HttpClient, protected router: Router, protected $window: WindowRef, private applicationConfigService: ApplicationConfigService) {
  }

  create(flow: IFlow): Observable<EntityResponseType> {
    return this.http.post<IFlow>(this.resourceUrl, flow, { observe: 'response' });
  }

  update(flow: IFlow): Observable<EntityResponseType> {
    return this.http.put<IFlow>(this.resourceUrl, flow, { observe: 'response' });
  }

  find(flowId: number): Observable<EntityResponseType> {
    return this.http.get<IFlow>(`${this.resourceUrl}/${flowId}`, { observe: 'response' });
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

  getConfiguration(flowid: number): Observable<HttpResponse<any>> {
    return this.http.get(`${this.environmentUrl}/${this.integrationid}/flow/${flowid}`, {
      headers: new HttpHeaders({ PlaceholderReplacement: 'true', Accept: 'application/xml' }),
      observe: 'response',
      responseType: 'text',
    });
  }

  setConfiguration(id: number, xmlconfiguration: string, header?: string): Observable<any> {
    if (header) {
      return this.http.post(`${this.integrationUrl}/${this.integrationid}/flow/${id}/configure`, xmlconfiguration, {
        headers: new HttpHeaders({ PlaceholderReplacement: 'true', Accept: 'application/xml' }),
        observe: 'response',
        responseType: 'text',
      });
    } else {
      return this.http.post(`${this.integrationUrl}/${this.integrationid}/flow/${id}/configure`, xmlconfiguration, {
        observe: 'response',
        responseType: 'text',
      });
    }
  }

  saveFlows(id: number, xmlconfiguration: string, header: string): Observable<EntityResponseType> {
    const options = {
      headers: new HttpHeaders({ Accept: 'application/xml' }),
    };
    return this.http.post<any>(`${this.environmentUrl}/${this.integrationid}/flow/${id}`, xmlconfiguration, options);
  }

  validateFlowsUri(integrationId: number, uri: string): Observable<EntityResponseType> {
    const options = {
      headers: new HttpHeaders({ Accept: 'application/xml' }),
    };
    return this.http.get<any>(`${this.validationUrl}/${integrationId}/uri`, options);
  }

  start(flowId: number): Observable<HttpResponse<any>> {
    return this.http.get(`${this.integrationUrl}/${this.integrationid}/flow/${flowId}/start`, { observe: 'response', responseType: 'text' });
  }

  pause(flowId: number): Observable<HttpResponse<any>> {
    return this.http.get(`${this.integrationUrl}/${this.integrationid}/flow/${flowId}/pause`, { observe: 'response', responseType: 'text' });
  }

  resume(flowId: number): Observable<HttpResponse<any>> {
    return this.http.get(`${this.integrationUrl}/${this.integrationid}/flow/${flowId}/resume`, { observe: 'response', responseType: 'text' });
  }

  restart(flowId: number): Observable<HttpResponse<any>> {
    return this.http.get(`${this.integrationUrl}/${this.integrationid}/flow/${flowId}/restart`, { observe: 'response', responseType: 'text' });
  }

  stop(flowId: number): Observable<HttpResponse<any>> {
    return this.http.get(`${this.integrationUrl}/${this.integrationid}/flow/${flowId}/stop`, { observe: 'response', responseType: 'text' });
  }

  getFlowStatus(flowId: number): Observable<any> {
    return this.http.get(`${this.integrationUrl}/${this.integrationid}/flow/${flowId}/status`, { observe: 'response', responseType: 'text' });
  }

  getFlowAlerts(flowId: number): Observable<any> {
    return this.http.get(`${this.integrationUrl}/${this.integrationid}/flow/${flowId}/alerts`, { observe: 'response', responseType: 'text' });
  }

  getFlowNumberOfAlerts(flowId: number): Observable<any> {
    return this.http.get(`${this.integrationUrl}/${this.integrationid}/flow/${flowId}/alerts/count`, {
      observe: 'response',
      responseType: 'text',
    });
  }

  getFlowLastError(flowId: number): Observable<any> {
    return this.http.get(`${this.integrationUrl}/${this.integrationid}/flow/${flowId}/lasterror`, {
      observe: 'response',
      responseType: 'text',
    });
  }

  getFlowStats(flowId: number, stepid: number, integrationid: number): Observable<HttpResponse<any>> {
    return this.http.get(`${this.integrationUrl}/${integrationid}/flow/${flowId}/step/${stepid}/stats`,
        {
          headers: new HttpHeaders({ FullStats: 'true', Accept: 'application/json' }),
          observe: 'response'
        })

  }

  getComponentOptions(integrationid: number, componentType: String): Observable<any> {
    return this.http.get(`${this.integrationUrl}/${integrationid}/flow/schema/` + componentType, { observe: 'response' });
  }

  getWikiDocUrl(): Observable<HttpResponse<any>> {
	const url = this.applicationConfigService.getEndpointFor('/api/wiki-url');
    return this.http.get(url, { observe: 'response', responseType: 'text' });
  }

  getCamelDocUrl(): Observable<HttpResponse<any>> {
    const url = this.applicationConfigService.getEndpointFor('/api/camel-url');
    return this.http.get(url, { observe: 'response', responseType: 'text' });
  }

  getIntegrationName(): Observable<HttpResponse<any>> {
	const url = this.applicationConfigService.getEndpointFor('/api/gateway-name');
    return this.http.get(url, { observe: 'response', responseType: 'text' });
  }

  setMaintenance(time: number, flowsIds: Array<number>): Observable<HttpResponse<any>> {
    return this.http.post(`${this.integrationUrl}/${this.integrationid}/flow/maintenance/${time}`, flowsIds, {
      observe: 'response',
      responseType: 'text',
    });
  }

  testConnection(integrationid: number, host: string, port: number, timeout: number): Observable<HttpResponse<any>> {
    return this.http.get(`${this.validationUrl}/${this.integrationid}/connection/${host}/${port}/${timeout}`, {
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
  ): Observable<any> {
    const options = new HttpHeaders({
      uri,
      stepId,
      connectionid: connectionId,
      connectionKeys,
      header,
      'Content-Type': 'text/plain',
      Accept: 'text/plain',
    });
    return this.http.post(`${this.integrationUrl}/${integrationId}/send/${numberOfTimes}`, messageBody, {
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
  ): Observable<any> {
    const options = new HttpHeaders({
      uri,
      stepId,
      connectionid: connectionId,
      connectionKeys,
      header,
      'Content-Type': 'text/plain',
      Accept: 'text/plain',
    });
    return this.http.post(`${this.integrationUrl}/${integrationId}/sendrequest`, messageBody, {
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

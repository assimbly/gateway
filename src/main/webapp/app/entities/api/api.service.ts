import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { Observable, catchError, map, of, shareReplay } from 'rxjs';

import { serverApiUrl } from 'app/config';
import { HANDLES_OWN_ERRORS } from 'app/core/interceptor/error-handler.interceptor';
import { IApi, IApiHandler, IApiImportResult, IApiOperation, ITryRequest, ITryResponse } from './api.model';

/** Calls whose failures the page explains itself, next to what the user did, instead of the page's error alert. */
const OWN_ERRORS = new HttpContext().set(HANDLES_OWN_ERRORS, true);

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly resourceUrl = `${serverApiUrl}api/apis`;
  private listener?: Observable<string>;

  query(): Observable<IApi[]> {
    return this.http.get<IApi[]>(this.resourceUrl);
  }

  find(id: number): Observable<IApi> {
    return this.http.get<IApi>(`${this.resourceUrl}/${id}`);
  }

  create(api: IApi): Observable<IApi> {
    return this.http.post<IApi>(this.resourceUrl, api, { context: OWN_ERRORS });
  }

  update(api: IApi): Observable<IApi> {
    return this.http.put<IApi>(`${this.resourceUrl}/${api.id}`, api, { context: OWN_ERRORS });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.resourceUrl}/${id}`, { context: OWN_ERRORS });
  }

  createOperation(apiId: number, operation: IApiOperation): Observable<IApiOperation> {
    return this.http.post<IApiOperation>(`${this.resourceUrl}/${apiId}/operations`, operation, { context: OWN_ERRORS });
  }

  updateOperation(apiId: number, operation: IApiOperation): Observable<IApiOperation> {
    return this.http.put<IApiOperation>(`${this.resourceUrl}/${apiId}/operations/${operation.id}`, operation, { context: OWN_ERRORS });
  }

  deleteOperation(apiId: number, operationId: number): Observable<void> {
    return this.http.delete<void>(`${this.resourceUrl}/${apiId}/operations/${operationId}`, { context: OWN_ERRORS });
  }

  tryOperation(apiId: number, operationId: number, request: ITryRequest): Observable<ITryResponse> {
    return this.http.post<ITryResponse>(`${this.resourceUrl}/${apiId}/operations/${operationId}/try`, request, { context: OWN_ERRORS });
  }

  importDocument(document: string): Observable<IApiImportResult> {
    return this.http.post<IApiImportResult>(`${this.resourceUrl}/import`, document, { headers: { 'Content-Type': 'text/plain' }, context: OWN_ERRORS });
  }

  /** The API as an OpenAPI 3.0.3 document, with the file name the Gateway gives it. */
  exportDocument(id: number, format: 'yaml' | 'json' = 'yaml'): Observable<{ text: string; fileName: string }> {
    return this.http
      .get(`${this.resourceUrl}/${id}/openapi`, { params: new HttpParams().set('format', format), observe: 'response', responseType: 'text' })
      .pipe(
        map(response => ({
          text: response.body ?? '',
          fileName: /filename="?([^";]+)"?/.exec(response.headers.get('Content-Disposition') ?? '')?.[1] ?? `openapi.${format}`,
        })),
      );
  }

  /** Every Handler Flow by its Flow id. */
  handlers(): Observable<Record<number, IApiHandler>> {
    return this.http.get<Record<number, IApiHandler>>(`${this.resourceUrl}/handlers`);
  }

  /** The runtime's REST listener as callers reach it; an Operation's URL is this and its runtime path. */
  listenerUrl(): Observable<string> {
    this.listener ??= this.http.get<{ url: string }>(`${this.resourceUrl}/listener`).pipe(
      map(listener => listener.url),
      shareReplay(1),
    );
    return this.listener;
  }

  /** The API and Operation a Flow handles; undefined when it isn't a Handler Flow. */
  handlerOf(flowId: number): Observable<IApiHandler | undefined> {
    return this.http.get<IApiHandler>(`${this.resourceUrl}/handlers/${flowId}`, { context: OWN_ERRORS }).pipe(catchError(() => of(undefined)));
  }
}

/** The message of a failed call: the Gateway's explanation when it gave one. */
export function errorMessage(error: unknown): string {
  const body = (error as { error?: unknown })?.error;
  if (body && typeof body === 'object' && 'detail' in body && typeof (body as { detail: unknown }).detail === 'string') {
    return (body as { detail: string }).detail;
  }
  if (typeof body === 'string' && body.trim()) {
    return body;
  }
  return 'That did not work. Please try again.';
}

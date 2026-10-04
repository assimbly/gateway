import { Component, EventEmitter, Input, OnChanges, Output, inject } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CodemirrorModule } from '@ctrl/ngx-codemirror';

import { ThemeService } from 'app/core/theme';
import { DEFAULT_MEDIA_TYPE, IApi, IApiDeclaredResponse, IApiOperation, IApiParameter, ITryResponse, METHODS, PARAMETER_TYPES } from './api.model';
import { ApiService, errorMessage } from './api.service';
import { HandlerFlowState } from './handler-flows.service';
import { withPathParameters } from './path-parameters';
import { exampleFromSchema, schemaFromExampleText } from './schema-from-example';

/** Where a schema is edited: the request, or the Declared response at this index. */
type SchemaTarget = 'request' | number;

/**
 * An Operation in the API page's side panel: its contract (method, path, parameters, media types, request schema and
 * Declared responses), Open Handler Flow, and Try it. Path parameters follow the path as it is typed.
 */
@Component({
  selector: 'jhi-operation-panel',
  templateUrl: './operation-panel.component.html',
  imports: [NgTemplateOutlet, FormsModule, RouterModule, FontAwesomeModule, CodemirrorModule],
})
export class OperationPanelComponent implements OnChanges {
  @Input({ required: true }) api!: IApi;
  /** The Operation to edit; none for a new one. */
  @Input() operation?: IApiOperation;
  @Input() state?: HandlerFlowState;

  @Output() saved = new EventEmitter<IApiOperation>();
  @Output() deleted = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  private readonly apiService = inject(ApiService);
  private readonly themeService = inject(ThemeService);

  readonly methods = METHODS;
  readonly parameterTypes = PARAMETER_TYPES;
  readonly mediaTypes = ['application/json', 'application/xml', 'text/plain', 'text/csv', 'application/octet-stream'];

  draft!: IApiOperation;
  saving = false;
  message?: string;

  /** The schema whose "Generate from example JSON" is open, with the example typed so far. */
  exampleFor?: SchemaTarget;
  exampleText = '';
  exampleError?: string;
  /** The Declared responses whose schema editor is open, by index. */
  openSchemas = new Set<number>();

  tryValues: Record<string, string> = {};
  tryBody = '';
  trying = false;
  tryResult?: ITryResponse;
  tryError?: string;

  private optionsTheme = '';
  private optionsCache?: Record<string, unknown>;

  get isNew(): boolean {
    return !this.operation?.id;
  }

  ngOnChanges(): void {
    this.draft = this.operation
      ? structuredClone(this.operation)
      : { method: 'GET', path: '/', parameters: [], declaredResponses: [], flowType: 'flow', requestMediaType: DEFAULT_MEDIA_TYPE, responseMediaType: DEFAULT_MEDIA_TYPE };
    this.message = undefined;
    this.exampleFor = undefined;
    this.openSchemas = new Set();
    this.tryResult = undefined;
    this.tryError = undefined;
    this.tryValues = {};
    this.tryBody = this.exampleBody();
  }

  jsonEditorOptions(): Record<string, unknown> {
    const theme = this.themeService.editorTheme();
    if (!this.optionsCache || this.optionsTheme !== theme) {
      this.optionsTheme = theme;
      this.optionsCache = { mode: { name: 'javascript', json: true }, lineNumbers: true, lineWrapping: true, theme };
    }
    return this.optionsCache;
  }

  onPathChange(path: string): void {
    this.draft.path = path;
    this.draft.parameters = withPathParameters(path, this.draft.parameters);
  }

  addParameter(): void {
    this.draft.parameters = [...this.draft.parameters, { name: '', in: 'query', type: 'string', required: false }];
  }

  removeParameter(parameter: IApiParameter): void {
    this.draft.parameters = this.draft.parameters.filter(p => p !== parameter);
  }

  addResponse(): void {
    const used = new Set(this.draft.declaredResponses.map(r => r.status));
    const status = ['200', '201', '204', '400', '404'].find(s => !used.has(s)) ?? '';
    this.draft.declaredResponses = [...this.draft.declaredResponses, { status, description: '' }];
  }

  removeResponse(response: IApiDeclaredResponse): void {
    this.draft.declaredResponses = this.draft.declaredResponses.filter(r => r !== response);
    this.openSchemas = new Set();
  }

  toggleSchema(index: number): void {
    const open = new Set(this.openSchemas);
    if (!open.delete(index)) {
      open.add(index);
    }
    this.openSchemas = open;
  }

  openExample(target: SchemaTarget): void {
    this.exampleFor = this.exampleFor === target ? undefined : target;
    this.exampleText = '';
    this.exampleError = undefined;
  }

  generateSchema(): void {
    const result = schemaFromExampleText(this.exampleText);
    if ('error' in result) {
      this.exampleError = result.error;
      return;
    }
    if (this.exampleFor === 'request') {
      this.draft.requestSchema = result.schema;
      this.tryBody = this.exampleBody();
    } else if (typeof this.exampleFor === 'number') {
      this.draft.declaredResponses[this.exampleFor].schema = result.schema;
      this.openSchemas = new Set([...this.openSchemas, this.exampleFor]);
    }
    this.exampleFor = undefined;
  }

  save(): void {
    this.saving = true;
    this.message = undefined;
    const request = this.isNew ? this.apiService.createOperation(this.api.id!, this.draft) : this.apiService.updateOperation(this.api.id!, this.draft);
    request.subscribe({
      next: saved => {
        this.saving = false;
        this.saved.emit(saved);
      },
      error: error => {
        this.saving = false;
        this.message = errorMessage(error);
      },
    });
  }

  delete(): void {
    const operation = this.operation!;
    if (!window.confirm(`Delete ${operation.method} ${operation.fullPath}? Its Handler Flow ${operation.handlerFlowName} is deleted too.`)) {
      return;
    }
    this.apiService.deleteOperation(this.api.id!, operation.id!).subscribe({
      next: () => this.deleted.emit(),
      error: error => (this.message = errorMessage(error)),
    });
  }

  /** The Handler Flow's editor, with the type of editor its Flow type opens in. */
  handlerFlowQueryParams(): Record<string, unknown> {
    return { mode: 'edit', editor: this.operation?.flowType || 'flow', id: this.operation?.handlerFlowId };
  }

  parametersIn(where: IApiParameter['in']): IApiParameter[] {
    return (this.operation?.parameters ?? []).filter(p => p.in === where);
  }

  tryKey(parameter: IApiParameter): string {
    return `${parameter.in}:${parameter.name}`;
  }

  sendTry(): void {
    const operation = this.operation!;
    const values = (where: IApiParameter['in']): Record<string, string> =>
      Object.fromEntries(this.parametersIn(where).map(p => [p.name, this.tryValues[this.tryKey(p)] ?? '']));
    this.trying = true;
    this.tryResult = undefined;
    this.tryError = undefined;
    this.apiService
      .tryOperation(this.api.id!, operation.id!, { pathParameters: values('path'), query: values('query'), headers: values('header'), body: this.tryBody || undefined })
      .subscribe({
        next: result => {
          this.trying = false;
          this.tryResult = result;
        },
        error: error => {
          this.trying = false;
          this.tryError = errorMessage(error);
        },
      });
  }

  tryHeaders(result: ITryResponse): { name: string; value: string }[] {
    return Object.entries(result.headers)
      .filter(([name]) => name !== ':status')
      .map(([name, value]) => ({ name, value }));
  }

  /** The request schema's example, as a body to start Try it from. */
  private exampleBody(): string {
    const schemaText = this.draft?.requestSchema;
    if (!schemaText) {
      return '';
    }
    try {
      return JSON.stringify(exampleFromSchema(JSON.parse(schemaText)), null, 2);
    } catch {
      return '';
    }
  }
}

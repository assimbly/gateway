import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { IFlow } from 'app/shared/model/flow.model';
import { sourceStepOf } from '../flow-status';

/** The Flows a Call Flow can call: those whose Source is a flowlink Source. */
export function callableFlows(flows: IFlow[], exceptFlowId?: number): IFlow[] {
  return flows.filter(flow => {
    const source = sourceStepOf(flow.steps);
    const component = (source?.componentType || source?.uri || '').toLowerCase().replace(/:.*$/, '');
    return flow.id !== exceptFlowId && component === 'flowlink';
  });
}

/**
 * The right-hand panel for a Call Flow (flowlink) Step: which Flow it calls, picked from the Flows that have a flowlink
 * Source, and the transport. As an Action it waits for that Flow's answer (InOut); as a Sink it hands the message
 * over (InOnly).
 */
@Component({
  selector: 'jhi-call-flow-editor',
  templateUrl: './call-flow-editor.component.html',
  imports: [FormsModule, FontAwesomeModule],
})
export class CallFlowEditorComponent implements OnChanges {
  @Input() options?: string | null;
  @Input() kind: 'ACTION' | 'SINK' = 'ACTION';
  @Input() flows: IFlow[] = [];
  @Input() problem?: string;
  @Input() deletable = false;

  @Output() optionsChange = new EventEmitter<string>();
  @Output() remove = new EventEmitter<void>();

  targetFlowId = '';
  transport = 'sync';

  ngOnChanges(): void {
    const options = new Map((this.options ?? '').split('&').filter(Boolean).map(option => option.split('=', 2) as [string, string]));
    this.targetFlowId = options.get('targetFlowId') ?? '';
    this.transport = options.get('transport') || 'sync';
  }

  get pattern(): string {
    return this.kind === 'ACTION' ? 'InOut' : 'InOnly';
  }

  emit(): void {
    const options = [`transport=${this.transport}`];
    if (this.targetFlowId) {
      options.push(`targetFlowId=${this.targetFlowId}`);
    }
    options.push(`exchangePattern=${this.pattern}`);
    this.optionsChange.emit(options.join('&'));
  }
}

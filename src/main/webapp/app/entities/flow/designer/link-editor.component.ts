import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { canDeleteBranch, canRenameBranch, defaultBranch, DesignLink, FlowGraph, LinkSettings, routerKind, routerOf, takesCondition } from './flow-graph';

/** Edits the Link leading to a Step: its Branch name and Condition (on a Router) and its transport settings. */
@Component({
  selector: 'jhi-link-editor',
  templateUrl: './link-editor.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule],
})
export class LinkEditorComponent {
  @Input({ required: true }) graph!: FlowGraph;
  @Input({ required: true }) link!: DesignLink;
  @Input() readOnly = false;
  @Input() problem?: string;

  @Output() linkChange = new EventEmitter<Partial<LinkSettings>>();
  @Output() deleteBranch = new EventEmitter<void>();

  readonly languages = ['simple', 'constant', 'header', 'jsonpath', 'xpath', 'groovy', 'javascript', 'python'];
  readonly transports = ['sync', 'async'];
  readonly patterns = ['', 'InOnly', 'InOut'];

  get router() {
    return routerOf(this.graph, this.link);
  }

  get fromLabel(): string {
    const from = this.graph.steps.find(s => s.key === this.link.from);
    return from ? `${from.kind} ${from.kind === 'ROUTER' ? routerKind(from) : from.componentType || ''}` : '';
  }

  get toLabel(): string {
    const to = this.graph.steps.find(s => s.key === this.link.to);
    return to ? `${to.kind} ${to.componentType || to.uri || ''}` : '';
  }

  get isDefaultBranch(): boolean {
    const router = this.router;
    return !!router && this.link === defaultBranch(this.graph, router);
  }

  get canRename(): boolean {
    return !this.readOnly && canRenameBranch(this.graph, this.link.to);
  }

  get hasCondition(): boolean {
    return takesCondition(this.graph, this.link.to);
  }

  get canDelete(): boolean {
    return !this.readOnly && canDeleteBranch(this.graph, this.link.to);
  }

  update(settings: Partial<LinkSettings>): void {
    this.linkChange.emit(settings);
  }
}

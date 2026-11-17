import { ChangeDetectionStrategy, Component, output, input } from '@angular/core';
import { FormsModule } from '@angular/forms';

import {
  canDeleteBranch,
  canRenameBranch,
  defaultBranch,
  DesignLink,
  FlowGraph,
  LinkSettings,
  routerOf,
  routerTitle,
  takesCondition,
} from './flow-graph';

/** Edits the Link leading to a Step: its Branch name and Condition (on a Router) and its transport settings. */
@Component({
  selector: 'jhi-link-editor',
  templateUrl: './link-editor.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
})
export class LinkEditorComponent {
  readonly graph = input.required<FlowGraph>();
  readonly link = input.required<DesignLink>();
  readonly readOnly = input(false);
  readonly problem = input<string>();

  readonly linkChange = output<Partial<LinkSettings>>();
  readonly deleteBranch = output<void>();

  // What is saved stays the id Camel knows; the label is how the choice reads here and on the Send page.
  readonly languages = [
    { value: 'simple', label: 'Simple expression' },
    { value: 'constant', label: 'Fixed value' },
    { value: 'header', label: 'Header' },
    { value: 'jsonpath', label: 'JSONPath' },
    { value: 'xpath', label: 'XPath' },
    { value: 'groovy', label: 'Groovy' },
    { value: 'javascript', label: 'JavaScript' },
  ];
  readonly transports = [
    { value: 'sync', label: 'Direct' },
    { value: 'async', label: 'Through a queue' },
  ];
  readonly patterns = [
    { value: '', label: 'Default' },
    { value: 'InOnly', label: 'Fire and forget' },
    { value: 'InOut', label: 'Request and reply' },
  ];

  get router() {
    return routerOf(this.graph(), this.link());
  }

  get fromLabel(): string {
    const from = this.graph().steps.find(s => s.key === this.link().from);
    return from ? `${from.kind} ${from.kind === 'ROUTER' ? routerTitle(from) : from.componentType || ''}` : '';
  }

  get toLabel(): string {
    const to = this.graph().steps.find(s => s.key === this.link().to);
    return to ? `${to.kind} ${to.componentType || to.uri || ''}` : '';
  }

  get isDefaultBranch(): boolean {
    const router = this.router;
    return !!router && this.link() === defaultBranch(this.graph(), router);
  }

  get canRename(): boolean {
    return !this.readOnly() && canRenameBranch(this.graph(), this.link().to);
  }

  get hasCondition(): boolean {
    return takesCondition(this.graph(), this.link().to);
  }

  get canDelete(): boolean {
    return !this.readOnly() && canDeleteBranch(this.graph(), this.link().to);
  }

  update(settings: Partial<LinkSettings>): void {
    this.linkChange.emit(settings);
  }
}

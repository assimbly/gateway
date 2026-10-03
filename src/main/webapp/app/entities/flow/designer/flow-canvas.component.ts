import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { EFMarkerType, FCanvasComponent, FFlowModule, FMoveNodesEvent, FSelectionChangeEvent } from '@foblex/flow';

import { defaultBranch, DesignLink, DesignStep, FlowGraph, Problem, ROUTER_KINDS, routerKind, routerOf, routerShape } from './flow-graph';

/** What the right-hand panel shows: a Step, the Link leading to a Step, or the Flow settings. */
export type DesignerSelection = { type: 'step'; key: string } | { type: 'link'; to: string } | { type: 'flow' };

/**
 * The visual designer's canvas: draws a Flow graph and reports what the user does with it.
 * It never changes the graph itself; the editor applies each gesture to the Flow graph model.
 */
@Component({
  selector: 'jhi-flow-canvas',
  templateUrl: './flow-canvas.component.html',
  styleUrl: './flow-canvas.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FFlowModule, NgbDropdownModule, FontAwesomeModule],
})
export class FlowCanvasComponent {
  @Input({ required: true }) graph!: FlowGraph;
  @Input() problems: Problem[] = [];
  @Input() selection: DesignerSelection = { type: 'flow' };
  @Input() readOnly = false;

  @Output() selectionChange = new EventEmitter<DesignerSelection>();
  @Output() insertStep = new EventEmitter<{ linkTo: string; kind: 'ACTION' | 'ROUTER'; componentType: string }>();
  @Output() addBranch = new EventEmitter<string>();
  @Output() moveStep = new EventEmitter<{ key: string; x: number; y: number }>();

  @ViewChild(FCanvasComponent) canvas?: FCanvasComponent;

  readonly routerKinds = ROUTER_KINDS;
  readonly endMarker = EFMarkerType.END_ALL_STATES;

  label(step: DesignStep): string {
    return step.kind === 'ROUTER' ? routerKind(step) : step.componentType || step.uri || 'choose a component';
  }

  /** The Branch name (or "default") and Condition shown on a Router's Link; nothing on other Links. */
  branchLabel(link: DesignLink): string | undefined {
    const router = routerOf(this.graph, link);
    if (!router) {
      return undefined;
    }
    const name = link === defaultBranch(this.graph, router) ? 'default' : link.rule;
    const returns = link.rule && routerShape(router).returnsToRouter ? ' ↩' : '';
    const text = [name, link.expression].filter(Boolean).join(': ');
    return text ? text + returns : undefined;
  }

  canAddBranch(step: DesignStep): boolean {
    return step.kind === 'ROUTER' && routerShape(step).slots === 'list';
  }

  hasProblem(step: DesignStep): boolean {
    return this.problems.some(p => p.stepKey === step.key);
  }

  linkHasProblem(link: DesignLink): boolean {
    return this.problems.some(p => p.linkTo === link.to);
  }

  isSelected(step: DesignStep): boolean {
    return this.selection.type === 'step' && this.selection.key === step.key;
  }

  isLinkSelected(link: DesignLink): boolean {
    return this.selection.type === 'link' && this.selection.to === link.to;
  }

  onSelectionChange(event: FSelectionChangeEvent): void {
    if (event.nodeIds.length) {
      this.selectionChange.emit({ type: 'step', key: event.nodeIds[0] });
    } else if (event.connectionIds.length) {
      this.selectionChange.emit({ type: 'link', to: event.connectionIds[0].replace(/^link-/, '') });
    } else {
      this.selectionChange.emit({ type: 'flow' });
    }
  }

  onMoveNodes(event: FMoveNodesEvent): void {
    event.nodes.forEach(node => this.moveStep.emit({ key: node.id, x: Math.round(node.position.x), y: Math.round(node.position.y) }));
  }

  fitToScreen(): void {
    this.canvas?.fitToScreen({ x: 80, y: 80 }, false, false, 1);
  }
}

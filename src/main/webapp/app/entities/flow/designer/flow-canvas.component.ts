import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  QueryList,
  TemplateRef,
  ViewChild,
  ViewChildren,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { EFMarkerType, FCanvasComponent, FFlowModule, FMinimapComponent, FMoveNodesEvent, FSelectionChangeEvent } from '@foblex/flow';

import { defaultBranch, DesignLink, DesignStep, FlowGraph, openEnds, Problem, routerKind, routerOf, routerShape, StepKind } from './flow-graph';
import { PickedKind, StepComponents, StepPickerComponent } from './step-picker.component';

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
  imports: [CommonModule, FFlowModule, FontAwesomeModule, StepPickerComponent],
})
export class FlowCanvasComponent {
  @Input({ required: true }) graph!: FlowGraph;
  @Input() problems: Problem[] = [];
  @Input() selection: DesignerSelection = { type: 'flow' };
  @Input() readOnly = false;
  @Input() components: StepComponents = { actions: [], sinks: [] };

  @Output() selectionChange = new EventEmitter<DesignerSelection>();
  /** A Step was double-clicked, to show or hide its editor. */
  @Output() openStep = new EventEmitter<string>();
  @Output() insertStep = new EventEmitter<{ linkTo: string; kind: 'ACTION' | 'ROUTER'; componentType: string }>();
  @Output() appendStep = new EventEmitter<{ after: string; kind: PickedKind; componentType: string }>();
  @Output() addBranch = new EventEmitter<string>();
  @Output() moveStep = new EventEmitter<{ key: string; x: number; y: number }>();

  @ViewChild(FCanvasComponent) canvas?: FCanvasComponent;
  @ViewChild(FMinimapComponent) private minimapComponent?: FMinimapComponent;
  @ViewChildren(StepPickerComponent) private pickers?: QueryList<StepPickerComponent>;

  /** The minimap of this canvas, for the editor to show elsewhere on the page. */
  @ViewChild('minimap', { static: true }) minimap!: TemplateRef<unknown>;

  /** Where the minimap last moved the view to; unset until then, so Foblex keeps its own position. */
  canvasPosition?: { x: number; y: number };

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly cdr = inject(ChangeDetectorRef);

  /** Between two Steps only an Action or Router fits; after an open end the Flow can also end in a Sink. */
  readonly insertKinds: PickedKind[] = ['ACTION', 'ROUTER'];
  readonly appendKinds: PickedKind[] = ['ACTION', 'ROUTER', 'SINK'];
  readonly endMarker = EFMarkerType.END_ALL_STATES;
  readonly kindIcons: Record<StepKind, IconProp> = { SOURCE: 'sign-in-alt', ACTION: 'cogs', ROUTER: 'code-branch', SINK: 'sign-out-alt' };

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

  problemOf(step: DesignStep): string | undefined {
    const messages = this.problems.filter(p => p.stepKey === step.key).map(p => p.message);
    return messages.length ? messages.join(' ') : undefined;
  }

  isOpenEnd(step: DesignStep): boolean {
    return openEnds(this.graph).includes(step);
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

  private fitted = false;

  /** Whether the Steps are shown: only once the first fit has moved them into place, so they don't jump there. */
  shown = false;

  /** Shows the canvas anyway should Foblex never report its Steps rendered. */
  private readonly showFallback = setTimeout(() => this.show(), 1500);

  private show(): void {
    clearTimeout(this.showFallback);
    if (!this.shown) {
      this.shown = true;
      this.cdr.markForCheck();
    }
  }

  /**
   * Fits the Flow into view once, when it first appears; after that the view stays where the user put it.
   * A Flow of just its Source starts at the left, leaving the room on the right for the Steps still to come.
   * The fit waits a moment, because the Steps are not measured yet when Foblex reports them rendered. Until the
   * fit has been drawn the canvas stays invisible (but measured).
   */
  fitToScreen(): void {
    if (!this.fitted) {
      this.fitted = true;
      setTimeout(() => {
        if (this.graph.steps.length === 1) {
          this.showAtStart(this.graph.steps[0]);
        } else {
          this.canvas?.fitToScreen({ x: 80, y: 80 }, false, false, 1);
        }
        requestAnimationFrame(() => this.show());
      });
    }
  }

  private showAtStart(step: DesignStep): void {
    const flow = this.host.nativeElement.querySelector('f-flow')?.getBoundingClientRect();
    const node = this.host.nativeElement.querySelector(`[data-step-key="${step.key}"]`)?.getBoundingClientRect();
    if (flow && node) {
      this.canvasPosition = { x: START_MARGIN - (step.x ?? 0), y: (flow.height - node.height) / 2 - (step.y ?? 0) };
      this.cdr.markForCheck();
    }
  }

  /**
   * Opens the + menu that fits the selection: after a selected open end, on a selected Link, on the Link out of a
   * selected Step, or after the first open end when nothing is selected. Returns whether there was such a menu.
   */
  openStepPicker(selection: DesignerSelection): boolean {
    const target = this.pickerTarget(selection);
    const picker = target && this.pickers?.find(p => p.target === target);
    if (!target || !picker) {
      return false;
    }
    this.reveal(target.replace(/^(after|link):/, ''));
    setTimeout(() => picker.open());
    return true;
  }

  private pickerTarget(selection: DesignerSelection): string | undefined {
    if (this.readOnly) {
      return undefined;
    }
    if (selection.type === 'link') {
      return `link:${selection.to}`;
    }
    const ends = openEnds(this.graph);
    if (selection.type === 'flow') {
      return ends.length ? `after:${ends[0].key}` : undefined;
    }
    if (ends.some(s => s.key === selection.key)) {
      return `after:${selection.key}`;
    }
    const outbound = this.graph.links.filter(l => l.from === selection.key);
    return outbound.length === 1 ? `link:${outbound[0].to}` : undefined;
  }

  /**
   * Moves the view to a Step that was just added, when it isn't fully in view. The move is instant: Foblex
   * measures the new Step's Link meanwhile, and during an animated move it would measure it in the wrong place.
   */
  reveal(key: string): void {
    setTimeout(() => {
      const flow = this.host.nativeElement.querySelector('f-flow')?.getBoundingClientRect();
      const node = this.host.nativeElement.querySelector(`[data-step-key="${key}"]`)?.getBoundingClientRect();
      // The room on the right is for the Step's + button.
      const inView = !!flow && !!node && node.left >= flow.left && node.right + 40 <= flow.right && node.top >= flow.top && node.bottom <= flow.bottom;
      if (node && !inView) {
        this.canvas?.centerGroupOrNode(key, false);
      }
    });
  }

  /**
   * Pressing or dragging on the minimap centers the view on the point under the pointer. Foblex only does this
   * itself for a minimap inside the canvas; this one is shown in the editor's side panel.
   */
  onMinimapPointer(event: PointerEvent): void {
    if (event.type === 'pointerdown') {
      // Keep receiving the drag when the pointer leaves the minimap.
      (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    } else if (!(event.buttons & 1)) {
      return;
    }
    this.navigateFromMinimap(event);
  }

  private navigateFromMinimap(event: PointerEvent): void {
    const state = this.minimapComponent?.state;
    const flow = this.host.nativeElement.querySelector('f-flow')?.getBoundingClientRect();
    if (!state?.element || !state.viewBox || !flow || !this.canvas) {
      return;
    }
    const minimap = state.element.getBoundingClientRect();
    const { position, scaledPosition, scale } = this.canvas.transform;
    // Where the point lies in the view (the same calculation as Foblex's own minimap), then move it to the middle.
    const x = (state.viewBox.x + (event.clientX - minimap.left) * state.scale) * scale;
    const y = (state.viewBox.y + (event.clientY - minimap.top) * state.scale) * scale;
    this.canvasPosition = {
      x: position.x + scaledPosition.x - (x - flow.width / 2),
      y: position.y + scaledPosition.y - (y - flow.height / 2),
    };
    this.cdr.markForCheck();
  }
}

/** Space in pixels between the left edge of the canvas and the Source of a new Flow. */
const START_MARGIN = 48;

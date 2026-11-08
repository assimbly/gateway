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
import { EFMarkerType, FCanvasComponent, FFlowComponent, FFlowModule, FMinimapComponent, FMoveNodesEvent, FSelectionChangeEvent, FZoomDirective } from '@foblex/flow';

import { Components } from 'app/shared/camel/component-type';

import {
  canDeleteStep,
  defaultBranch,
  DesignLink,
  DesignStep,
  endsRequest,
  FlowGraph,
  isLockedSource,
  isResponse,
  openEnds,
  Problem,
  RESPONSE_COMPONENT,
  routerOf,
  routerShape,
  routerTitle,
  shownName,
  StepKind,
  StepMove,
} from './flow-graph';
import { responseSettings } from './response';
import { IFlowCounts } from '../flow.service';
import { compactCount } from '../flow-stats';
import { StepRun, StepRunMark, shortDuration } from '../test/flow-test-run';
import { PickedKind, StepComponents, StepPickerComponent } from './step-picker.component';

/** What is selected on the canvas: a Step, several Steps, the Link leading to a Step, or nothing (the Flow). */
export type DesignerSelection = { type: 'step'; key: string } | { type: 'steps'; keys: string[] } | { type: 'link'; to: string } | { type: 'flow' };

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
  /** What may not be meant but doesn't keep the Flow from running, such as an undeclared Response status. */
  @Input() warnings: Problem[] = [];
  @Input() selection: DesignerSelection = { type: 'flow' };
  @Input() readOnly = false;
  /** The full URL a Handler Flow's Operation is served on; the Operation's label links to it. */
  @Input() operationUrl?: string;
  @Input() components: StepComponents = { actions: [], sinks: [] };
  /** The messages each Step completed and failed, by Step key, shown as badges; the editor shows none. */
  @Input() counts?: ReadonlyMap<string, IFlowCounts>;
  /** What each Step did in the last test run, by Step key, shown as a badge with its time. */
  @Input() runResults?: ReadonlyMap<string, StepRunMark>;

  @Output() selectionChange = new EventEmitter<DesignerSelection>();
  /** A Step was double-clicked, to show or hide its editor. */
  @Output() openStep = new EventEmitter<string>();
  @Output() insertStep = new EventEmitter<{ linkTo: string; kind: 'ACTION' | 'ROUTER'; componentType: string }>();
  @Output() appendStep = new EventEmitter<{ after: string; kind: PickedKind; componentType: string }>();
  @Output() addBranch = new EventEmitter<string>();
  @Output() moveSteps = new EventEmitter<StepMove[]>();
  /** The × on a Step was clicked. */
  @Output() deleteStep = new EventEmitter<string>();
  /** A Step got a new name; an empty one takes its name away. */
  @Output() renameStep = new EventEmitter<{ key: string; name: string }>();
  /** Auto-arrange on the minimap was clicked, to lay the Flow out from left to right. */
  @Output() autoArrange = new EventEmitter<void>();

  @ViewChild(FFlowComponent) private flow?: FFlowComponent;
  @ViewChild(FCanvasComponent) canvas?: FCanvasComponent;
  @ViewChild(FMinimapComponent) private minimapComponent?: FMinimapComponent;
  @ViewChild(FZoomDirective) private zoom?: FZoomDirective;
  @ViewChildren(StepPickerComponent) private pickers?: QueryList<StepPickerComponent>;

  /** The minimap of this canvas, for the editor to show elsewhere on the page. */
  @ViewChild('minimap', { static: true }) minimap!: TemplateRef<unknown>;

  /** Where the minimap last moved the view to; unset until then, so Foblex keeps its own position. */
  canvasPosition?: { x: number; y: number };

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly cdr = inject(ChangeDetectorRef);
  /** Each component's title from the catalogue, such as 'File' for `file`. */
  private readonly titles = new Map<string, string>(inject(Components).types.map(type => [type.name, type.title ?? type.name]));

  /** Between two Steps only an Action or Router fits; after an open end the Flow can also end in a Sink. */
  readonly insertKinds: PickedKind[] = ['ACTION', 'ROUTER'];
  readonly appendKinds: PickedKind[] = ['ACTION', 'ROUTER', 'SINK'];
  readonly endMarker = EFMarkerType.END_ALL_STATES;
  readonly kindIcons: Record<StepKind, IconProp> = { SOURCE: 'sign-in-alt', ACTION: 'cogs', ROUTER: 'code-branch', SINK: 'sign-out-alt' };

  /** Whether the Step is the Operation a Handler Flow serves, which links to its URL. */
  isOperation(step: DesignStep): boolean {
    return !!this.graph.handler && isLockedSource(this.graph, step.key);
  }

  label(step: DesignStep): string {
    const handler = this.graph.handler;
    if (handler && isLockedSource(this.graph, step.key)) {
      return `${handler.method} ${handler.fullPath}`;
    }
    if (isResponse(this.graph, step)) {
      return `Response ${responseSettings(step).status}`;
    }
    if (step.componentType?.toLowerCase() === 'flowlink') {
      return 'Call Flow';
    }
    if (step.kind === 'ROUTER') {
      return routerTitle(step);
    }
    return step.componentType ? (this.titles.get(step.componentType) ?? step.componentType) : step.uri || 'choose a component';
  }

  /**
   * What a Step works on, shown under it: its path, such as a folder or a queue, shortened in the middle when long.
   * Routers, Responses, Call Flows and the Operation have none.
   */
  caption(step: DesignStep): string {
    if (!step.componentType || !step.uri || step.kind === 'ROUTER' || isResponse(this.graph, step) || isLockedSource(this.graph, step.key)) {
      return '';
    }
    return step.componentType.toLowerCase() === 'flowlink' ? '' : shortened(step.uri, CAPTION_LENGTH);
  }

  /** What the step kind shows: a Handler Flow's Source is its Operation, and a Response is named as such. */
  kindLabel(step: DesignStep): string {
    if (isLockedSource(this.graph, step.key)) {
      return 'OPERATION';
    }
    return isResponse(this.graph, step) ? 'RESPONSE' : step.kind;
  }

  /** The components with a Response first; kept while the components stay the same, so the pickers keep theirs. */
  private withResponse?: { from: StepComponents; components: StepComponents };

  /** The components after an open end: in a Handler Flow, a Response comes first where the Branch ends the request. */
  appendComponents(step: DesignStep): StepComponents {
    if (!this.graph.handler || !endsRequest(this.graph, step.key)) {
      return this.components;
    }
    if (this.withResponse?.from !== this.components) {
      this.withResponse = { from: this.components, components: { ...this.components, sinks: [RESPONSE_COMPONENT, ...this.components.sinks] } };
    }
    return this.withResponse.components;
  }

  readonly compactCount = compactCount;

  readonly shortDuration = shortDuration;

  /** What the Step did in the last test run; nothing when it didn't run or there was no run. */
  runOf(step: DesignStep): StepRun | undefined {
    const mark = this.runResults?.get(step.key);
    return typeof mark === 'object' ? mark : undefined;
  }

  runTitle(run: StepRun): string {
    const what = run.status === 'failed' ? `Failed: ${run.error ?? 'no message'}` : run.status === 'running' ? 'Still running' : 'Completed';
    return `${what}. ${shortDuration(run.ownMillis)} in this Step, ${shortDuration(run.totalMillis)} with the Steps after it.`;
  }

  /** A count in full, for the badge's tooltip, such as "1,234 completed". */
  countTitle(count: number, what: string): string {
    return `${count.toLocaleString('en-US')} ${what}`;
  }

  warningOf(step: DesignStep): string | undefined {
    const messages = this.warnings.filter(p => p.stepKey === step.key).map(p => p.message);
    return messages.length ? messages.join(' ') : undefined;
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

  readonly shownName = shownName;

  /** The Step whose name is being typed under it, if any. */
  editingName?: string;

  @ViewChild('nameInput') private nameInput?: ElementRef<HTMLInputElement>;

  /** Turns the line under the Step into a field for its name, as double-clicking that line or F2 does. */
  editName(key: string): void {
    if (this.readOnly || !this.graph.steps.some(s => s.key === key)) {
      return;
    }
    this.editingName = key;
    this.cdr.markForCheck();
    setTimeout(() => this.nameInput?.nativeElement.select());
  }

  commitName(step: DesignStep, name: string): void {
    if (this.editingName !== step.key) {
      return;
    }
    this.editingName = undefined;
    if (name.trim() !== (shownName(step) ?? '')) {
      this.renameStep.emit({ key: step.key, name });
    }
  }

  cancelNameEdit(): void {
    this.editingName = undefined;
    this.cdr.markForCheck();
  }

  /** Whether the Step gets a ×: not the Source, nor a Step its Branch can't do without. */
  canDelete(step: DesignStep): boolean {
    return canDeleteStep(this.graph, step.key);
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
    const selection = this.selection;
    return (selection.type === 'step' && selection.key === step.key) || (selection.type === 'steps' && selection.keys.includes(step.key));
  }

  isLinkSelected(link: DesignLink): boolean {
    return this.selection.type === 'link' && this.selection.to === link.to;
  }

  /** Several Steps are selected by Shift+dragging a box around them or Ctrl+clicking them; read-only views show one. */
  onSelectionChange(event: FSelectionChangeEvent): void {
    if (event.nodeIds.length > 1 && !this.readOnly) {
      this.selectionChange.emit({ type: 'steps', keys: event.nodeIds });
    } else if (event.nodeIds.length) {
      this.selectionChange.emit({ type: 'step', key: event.nodeIds[0] });
    } else if (event.connectionIds.length) {
      this.selectionChange.emit({ type: 'link', to: event.connectionIds[0].replace(/^link-/, '') });
    } else {
      this.selectionChange.emit({ type: 'flow' });
    }
  }

  /** Selects every Step, as Ctrl+A does; with a single Step that is just that one. */
  selectAllSteps(): void {
    const keys = this.graph.steps.map(s => s.key);
    // Marked as changed, so Foblex reports the next click (such as one on the background) as a new selection.
    this.flow?.select(keys, []);
    this.selectionChange.emit(keys.length === 1 ? { type: 'step', key: keys[0] } : { type: 'steps', keys });
  }

  onMoveNodes(event: FMoveNodesEvent): void {
    this.moveSteps.emit(event.nodes.map(node => ({ key: node.id, x: Math.round(node.position.x), y: Math.round(node.position.y) })));
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
   * The fit waits a moment, because the Steps are not measured yet when Foblex reports them rendered. Until the
   * fit has been drawn the canvas stays invisible (but measured).
   */
  fitToScreen(): void {
    if (!this.fitted) {
      this.fitted = true;
      setTimeout(() => {
        this.fit();
        requestAnimationFrame(() => this.show());
      });
    }
  }

  /**
   * Brings the whole Flow into view without magnifying it. A Flow that fits as it is starts at the left, where its
   * Source is, rather than in the middle, so the room on the right is left for the Steps still to come; a larger
   * one is shrunk to fit. Foblex's own fit centers the Flow and only moves it later, so it is used just to shrink.
   */
  private fit(): void {
    const canvas = this.canvas;
    const flow = this.host.nativeElement.querySelector('f-flow')?.getBoundingClientRect();
    const nodes = Array.from(this.host.nativeElement.querySelectorAll<HTMLElement>('[data-step-key]'), node => node.getBoundingClientRect());
    if (!canvas || !flow?.width || !nodes.length) {
      return;
    }
    const left = Math.min(...nodes.map(node => node.left));
    const top = Math.min(...nodes.map(node => node.top));
    const width = Math.max(...nodes.map(node => node.right)) - left;
    const height = Math.max(...nodes.map(node => node.bottom)) - top;
    if (canvas.getScale() > 1 || width > flow.width - START_MARGIN - FIT_PADDING || height > flow.height - 2 * FIT_PADDING) {
      canvas.fitToScreen({ x: FIT_PADDING, y: FIT_PADDING }, false, false, 1);
      return;
    }
    // Foblex keeps the position in two parts; together they are where the canvas is drawn.
    const { position, scaledPosition } = canvas.transform;
    this.canvasPosition = {
      x: position.x + scaledPosition.x - (left - flow.left - START_MARGIN),
      y: position.y + scaledPosition.y - (top - flow.top) + (flow.height - height) / 2,
    };
    this.cdr.markForCheck();
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
    if (selection.type === 'steps') {
      return undefined;
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
   * Fits the Flow into view again when part of it is hidden, for example after the side panel opened over the
   * canvas or Auto-arrange moved the Steps. A Flow that is fully in view stays where the user put it.
   */
  keepInView(): void {
    setTimeout(() => {
      const flow = this.host.nativeElement.querySelector('f-flow')?.getBoundingClientRect();
      if (!flow?.width) {
        return;
      }
      const nodes: HTMLElement[] = Array.from(this.host.nativeElement.querySelectorAll('[data-step-key]'));
      const hidden = nodes.some(element => {
        const node = element.getBoundingClientRect();
        return node.left < flow.left || node.right > flow.right || node.top < flow.top || node.bottom > flow.bottom;
      });
      if (hidden) {
        this.fit();
      }
    });
  }

  /**
   * Pressing or dragging on the minimap centers the view on the point under the pointer. Foblex only does this
   * itself for a minimap inside its flow; the editor shows this one over a corner of the canvas instead.
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

  /** Zooms in on the middle of the view by one step, as one turn of the mouse wheel does. */
  zoomIn(): void {
    this.zoom?.zoomIn();
  }

  zoomOut(): void {
    this.zoom?.zoomOut();
  }
}

/** Space in pixels between the left edge of the canvas and the Source of a Flow brought into view. */
const START_MARGIN = 48;

/** Space in pixels kept around a Flow brought into view at the other edges; on the right it leaves room for a +. */
const FIT_PADDING = 80;

/** How many characters of a Step's path fit on one line under it. */
const CAPTION_LENGTH = 28;

/** The text as it is when it fits, otherwise its start and end around an ellipsis, so both the root and the file show. */
export function shortened(text: string, max: number): string {
  if (text.length <= max) {
    return text;
  }
  const head = Math.ceil((max - 1) / 2);
  return `${text.slice(0, head)}…${text.slice(text.length - (max - 1 - head))}`;
}

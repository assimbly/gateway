import { Component, ElementRef, computed, inject, input, output, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';
import { Router } from '@angular/router';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { NgbDropdownModule, NgbModal, NgbOffcanvas, NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { EMPTY, Observable, Subject, catchError, forkJoin, map, merge, of, switchMap, timer } from 'rxjs';

import { Components } from 'app/shared/camel/component-type';
import { isPlainKey, isRunShortcut, isStopShortcut, isTypingTarget } from 'app/shared/keyboard';
import { StatusControlsTone } from 'app/shared/table';

import { FlowService } from '../flow.service';
import {
  FlowAction,
  FlowFailure,
  RuntimeStatus,
  countLabel,
  failureOfError,
  flowEventOf,
  flowFailureOf,
  flowStatusView,
  hasRun,
  runtimeStatusOf,
  testMessageBlocked,
} from '../flow-status';
import { FlowRowAlerts } from '../flow-row-alerts.component';
import { FlowAlertsDrawerComponent } from '../flow-alerts-drawer.component';
import { FlowLogDrawerComponent } from '../flow-log-drawer.component';
import { CamelRouteDrawerComponent } from '../camel-route-drawer.component';

const POLL_INTERVAL = 10000;

/** The visual editor designs a Flow, or runs and tests the saved Flow. */
export type EditorMode = 'design' | 'test';

const TONE_CLASS: Record<StatusControlsTone, string> = {
  default: 'btn-fx-secondary',
  started: 'btn-fx-success',
  paused: 'btn-fx-warning',
  failed: 'btn-fx-danger',
};

/**
 * The one header row of every Flow editor: the Flow's name, its counters and Alerts, and the actions to save, start or
 * stop the Flow and send it a test message. The colour of Start/Stop shows the Flow status.
 *
 * The visual editor has two modes instead, switched with a toggle: Design saves the Flow or saves and tests it; Test
 * starts, pauses and stops the saved Flow, like the Flows list.
 */
@Component({
  selector: 'jhi-flow-editor-header',
  templateUrl: './flow-editor-header.component.html',
  styleUrl: './flow-editor-header.component.scss',
  imports: [NgClass, ReactiveFormsModule, FontAwesomeModule, NgbDropdownModule, NgbTooltip, FlowRowAlerts],
  host: {
    '(document:keydown)': 'onKeydown($event)',
  },
})
export class FlowEditorHeaderComponent {
  readonly nameControl = input.required<FormControl<string>>();
  /** The saved Flow's id; a new Flow has none until it is saved. */
  readonly flowId = input<number | null | undefined>();
  /** Why the Flow is a Draft, or null when it is complete enough to run. */
  readonly draftReason = input<string | null>(null);
  /** The Component of the Flow's Source, which a test message is sent to. */
  readonly sourceComponent = input<string | undefined>();
  /** The visual editor tests the Flow in its own Test panel instead of on the Send page. */
  readonly testInEditor = input(false);
  /** The header of the visual editor, with its Design/Test toggle. */
  readonly modes = input(false);
  readonly mode = input<EditorMode>('design');
  /** What the toggle calls the editing mode: Design in the visual editor, Code in the Route editor. */
  readonly designLabel = input('Design');
  readonly designIcon = input<IconProp>('pencil-alt');
  readonly saving = input(false);
  /** The Flow has edits that are not saved yet. */
  readonly unsaved = input(false);
  /** The last save succeeded and nothing changed since. */
  readonly saved = input(false);
  /** Whether the user tried to save, after which a missing name is an error rather than a hint. */
  readonly submitted = input(false);

  readonly save = output<void>();
  readonly saveAndStart = output<void>();
  /** Saves the running Flow and restarts it, so the change takes effect; Save alone keeps it on its previous configuration. */
  readonly saveAndRestart = output<void>();
  /** Save & close: saves the Flow and goes back to the Manage page. */
  readonly saveAndReturn = output<void>();
  /** Send test message was clicked in the visual editor, which opens its Test panel. */
  readonly testRequested = output<void>();
  /** The toggle, or its T key, asks for the other mode. */
  readonly modeChange = output<EditorMode>();

  readonly status = signal<RuntimeStatus>('inactive');
  readonly ran = signal(false);
  readonly completed = signal<number | null>(null);
  readonly failed = signal<number | null>(null);
  readonly alerts = signal(0);
  readonly busy = signal(false);
  /** Why the Flow last failed to start or stop, shown behind the Error badge; null when it didn't. */
  readonly failure = signal<FlowFailure | null>(null);

  readonly state = computed(() => flowStatusView(this.status(), this.draftReason() !== null));
  readonly toneClass = computed(() => (this.flowId() ? TONE_CLASS[this.state().tone] : 'btn-fx-secondary'));
  readonly running = computed(() => this.status() === 'active' || this.status() === 'paused');
  readonly completedLabel = computed(() => countLabel(this.completed(), this.ran()));
  readonly failedLabel = computed(() => countLabel(this.failed(), this.ran()));

  /** Why the Flow can't be started now, or null when it can. */
  readonly startBlocked = computed(() => {
    if (this.draftReason() !== null) {
      return `This Flow is a Draft: ${this.draftReason()}`;
    }
    return this.flowId() ? null : 'Save the Flow first.';
  });

  /** Why no test message can be sent now, or null when it can. */
  readonly testMessageBlocked = computed(() => {
    if (this.testInEditor()) {
      // The Test panel says itself why it can't run yet.
      return null;
    }
    const source = this.sourceComponent();
    return testMessageBlocked(this.status(), source ? (this.components.types.find(type => type.name === source) ?? { name: source }) : null);
  });

  shows(action: FlowAction): boolean {
    return this.state().controls.includes(action);
  }

  disabled(action: FlowAction): boolean {
    return this.state().disabled.includes(action);
  }

  /** A saved Flow switches between Design and Test; a new one has nothing to test yet. */
  toggleMode(): void {
    if (this.flowId()) {
      this.modeChange.emit(this.mode() === 'design' ? 'test' : 'design');
    }
  }

  /** The name is required: once the user empties it, or tries to save without one, the field says so. */
  nameInvalid(): boolean {
    const name = this.nameControl();
    return name.invalid && (name.dirty || this.submitted());
  }

  private readonly flowService = inject(FlowService);
  private readonly components = inject(Components);
  private readonly router = inject(Router);
  private readonly offcanvas = inject(NgbOffcanvas);
  private readonly modals = inject(NgbModal);
  private readonly nameInput = viewChild<ElementRef<HTMLInputElement>>('nameInput');
  private readonly refresh = new Subject<void>();

  constructor() {
    toObservable(this.flowId)
      .pipe(
        switchMap(id => (id ? merge(timer(0, POLL_INTERVAL), this.refresh).pipe(switchMap(() => this.readRuntime(id))) : EMPTY)),
        takeUntilDestroyed(),
      )
      .subscribe();
  }

  focusName(): void {
    this.nameInput()?.nativeElement.focus();
  }

  /**
   * Ctrl+Enter (Cmd+Enter) does what the Save & start button does, or Save & restart while the Flow runs;
   * Ctrl+Shift+Enter stops the Flow. Like Ctrl+S they also work while typing in a field or code editor, and only when
   * their button is enabled. In the visual editor T switches between Design and Test, but not while typing. A dialog or
   * drawer on top of the editor keeps the keys.
   */
  onKeydown(event: KeyboardEvent): void {
    const covered = this.modals.hasOpenModals() || this.offcanvas.hasOpenOffcanvas();
    if (this.modes() && !covered && (isPlainKey(event, 't') || isPlainKey(event, 'T')) && !isTypingTarget(event.target)) {
      event.preventDefault();
      this.toggleMode();
      return;
    }
    const run = isRunShortcut(event);
    if ((!run && !isStopShortcut(event)) || covered) {
      return;
    }
    event.preventDefault();
    if (this.busy() || (run && this.saving())) {
      return;
    }
    if (!run) {
      if (this.running()) {
        this.stop();
      }
    } else if (this.running()) {
      this.saveAndRestart.emit();
    } else if (this.draftReason() === null) {
      this.saveAndStart.emit();
    }
  }

  /** Starts the saved Flow. When the start fails the Flow shows the Error status. */
  start(id = this.flowId()): void {
    if (!id) {
      return;
    }
    this.run(this.flowService.configureAndStart(id));
  }

  /** Restarts the saved Flow with its saved configuration. */
  restart(id = this.flowId()): void {
    if (id) {
      this.run(this.flowService.configureAndRestart(id));
    }
  }

  stop(): void {
    const id = this.flowId();
    if (id) {
      this.run(this.flowService.stop(id));
    }
  }

  pause(): void {
    const id = this.flowId();
    if (id) {
      this.run(this.flowService.pause(id));
    }
  }

  resume(): void {
    const id = this.flowId();
    if (id) {
      this.run(this.flowService.resume(id));
    }
  }

  /** Opens the Alerts drawer. Clearing them also clears the Error: the Flow is then just stopped. */
  openAlerts(): void {
    const id = this.flowId();
    if (id) {
      FlowAlertsDrawerComponent.open(this.offcanvas, { id, name: this.nameControl().value }, () => {
        this.alerts.set(0);
        this.failure.set(null);
        if (this.status() === 'inactiveError') {
          this.status.set('inactive');
        }
      });
    }
  }

  openLog(): void {
    const id = this.flowId();
    if (id) {
      FlowLogDrawerComponent.open(this.offcanvas, { id, name: this.nameControl().value });
    }
  }

  /** Shows the Camel route the runtime built for the Flow. */
  openCamelRoute(): void {
    const id = this.flowId();
    if (id) {
      CamelRouteDrawerComponent.open(this.offcanvas, { id, name: this.nameControl().value });
    }
  }

  sendTestMessage(): void {
    if (this.testInEditor()) {
      this.testRequested.emit();
      return;
    }
    this.router.navigate(['/flow/message-sender'], { queryParams: { flowId: this.flowId() } });
  }

  private run(action: Observable<HttpResponse<string>>): void {
    this.busy.set(true);
    action.subscribe({
      next: response => {
        const failure = flowFailureOf(response.body);
        this.busy.set(false);
        this.failure.set(failure);
        this.status.set(failure ? 'inactiveError' : runtimeStatusOf(flowEventOf(response.body)));
        this.ran.set(true);
        this.refresh.next();
      },
      error: (error: HttpErrorResponse) => {
        this.busy.set(false);
        this.failure.set(failureOfError(error.error));
        this.status.set('inactiveError');
        this.ran.set(true);
        // The failure is an Alert now: count it.
        this.refresh.next();
      },
    });
  }

  private readRuntime(id: number): Observable<void> {
    return forkJoin([this.flowService.getFlowStatus(id), this.flowService.getFlowAlertsPage(id, 0, 0)]).pipe(
      switchMap(([status, alerts]) => {
        const reported = runtimeStatusOf(status.body);
        // A failed start stays an Error until the Flow runs again; the runtime itself may only report it as stopped.
        if (!(this.status() === 'inactiveError' && reported === 'inactive')) {
          this.status.set(reported);
        }
        if (reported === 'active' || reported === 'paused') {
          this.failure.set(null);
        }
        this.ran.set(this.ran() || hasRun(status.body));
        this.alerts.set(alerts.body?.total ?? 0);
        return this.ran() ? this.flowService.getFlowTransactions(id) : of(null);
      }),
      map(transactions => {
        if (transactions) {
          this.completed.set(transactions.body?.flow?.completed ?? null);
          this.failed.set(transactions.body?.flow?.failed ?? null);
        }
      }),
      catchError(() => EMPTY),
    );
  }
}

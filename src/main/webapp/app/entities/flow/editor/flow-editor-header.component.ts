import { Component, ElementRef, computed, inject, input, output, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { HttpResponse } from '@angular/common/http';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgbDropdownModule, NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { EMPTY, Observable, Subject, catchError, forkJoin, map, merge, of, switchMap, timer } from 'rxjs';

import { Components } from 'app/shared/camel/component-type';

import { FlowService } from '../flow.service';
import { RuntimeStatus, countLabel, hasRun, rowStatus, runtimeStatusOf, testMessageBlocked } from '../flow-row-status';
import { FlowStatusPillComponent } from '../flow-status-pill.component';

const POLL_INTERVAL = 10000;

/**
 * The one header row of every Flow editor: the breadcrumb with the Flow's name editable in place, the Flow status with
 * its counters and Alerts, and the actions to save, start or stop the Flow and send it a test message.
 */
@Component({
  selector: 'jhi-flow-editor-header',
  templateUrl: './flow-editor-header.component.html',
  styleUrl: './flow-editor-header.component.scss',
  imports: [ReactiveFormsModule, RouterLink, FontAwesomeModule, NgbDropdownModule, NgbTooltip, FlowStatusPillComponent],
})
export class FlowEditorHeaderComponent {
  readonly nameControl = input.required<FormControl<string>>();
  /** The saved Flow's id; a new Flow has none until it is saved. */
  readonly flowId = input<number | null | undefined>();
  /** Why the Flow is a Draft, or null when it is complete enough to run. */
  readonly draftReason = input<string | null>(null);
  /** The Component of the Flow's Source, which a test message is sent to. */
  readonly sourceComponent = input<string | undefined>();
  readonly saving = input(false);

  readonly save = output<void>();
  readonly saveAndStart = output<void>();

  readonly status = signal<RuntimeStatus>('inactive');
  readonly ran = signal(false);
  readonly completed = signal<number | null>(null);
  readonly failed = signal<number | null>(null);
  readonly alerts = signal(0);
  readonly busy = signal(false);

  readonly state = computed(() => rowStatus(this.status(), this.draftReason() !== null));
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
  readonly testMessageBlocked = computed(() =>
    testMessageBlocked(
      this.status(),
      this.components.types.find(type => type.name === this.sourceComponent()),
    ),
  );

  private readonly flowService = inject(FlowService);
  private readonly components = inject(Components);
  private readonly router = inject(Router);
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

  /** Starts the saved Flow. When the start fails the Flow shows the Error status. */
  start(id = this.flowId()): void {
    if (!id) {
      return;
    }
    this.run(this.flowService.configureAndStart(id));
  }

  stop(): void {
    const id = this.flowId();
    if (id) {
      this.run(this.flowService.stop(id));
    }
  }

  sendTestMessage(): void {
    this.router.navigate(['/flow/message-sender'], { queryParams: { flowId: this.flowId() } });
  }

  private run(action: Observable<HttpResponse<string>>): void {
    this.busy.set(true);
    action.subscribe({
      next: response => {
        this.busy.set(false);
        this.status.set(runtimeStatusOf(eventOf(response.body)));
        this.ran.set(true);
        this.refresh.next();
      },
      error: () => {
        this.busy.set(false);
        this.status.set('inactiveError');
        this.ran.set(true);
      },
    });
  }

  private readRuntime(id: number): Observable<void> {
    return forkJoin([this.flowService.getFlowStatus(id), this.flowService.getFlowAlertsPage(id, 0, 0)]).pipe(
      switchMap(([status, alerts]) => {
        this.status.set(runtimeStatusOf(status.body));
        this.ran.set(this.ran() || hasRun(status.body));
        this.alerts.set(alerts.body?.total ?? 0);
        return this.ran() ? this.flowService.getFlowMessages(id) : of(null);
      }),
      map(messages => {
        if (messages) {
          this.completed.set(messages.body?.completedTransactions ?? null);
          this.failed.set(messages.body?.failedTransactions ?? null);
        }
      }),
      catchError(() => EMPTY),
    );
  }
}

/** The event in a start or stop answer, such as `{"flow": {"event": "started"}}`. */
function eventOf(body: string | null): string | undefined {
  try {
    return JSON.parse(body ?? '')?.flow?.event;
  } catch {
    return undefined;
  }
}

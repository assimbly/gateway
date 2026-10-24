import { Component, inject, output, signal } from '@angular/core';
import { Router } from '@angular/router';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgbActiveOffcanvas, NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';

import { FlowAlert, parseAlert } from './flow-alerts';
import { explainError } from './flow-errors';
import { FlowService } from './flow.service';

const PAGE_SIZE = 10;

/** Longer errors are shown in three lines until Show all. */
const LONG_ERROR = 200;

/** The Flow a drawer shows the Alerts of. */
export interface AlertsFlow {
  id: number;
  name?: string;
  type?: string;
}

/**
 * A Flow's Alerts in a side drawer, newest first: why the Flow failed to start, stop and so on, and the messages that
 * failed. Every Alert shows the same fields: its time, the Endpoint when known, the error to copy and, for a common
 * error, what it means. Open Flow, and Clear, which clears them for everyone.
 */
@Component({
  selector: 'jhi-flow-alerts-drawer',
  templateUrl: './flow-alerts-drawer.component.html',
  styleUrl: './flow-alerts-drawer.component.scss',
  imports: [FontAwesomeModule],
})
export class FlowAlertsDrawerComponent {
  readonly cleared = output<void>();

  readonly alerts = signal<FlowAlert[]>([]);
  readonly total = signal(0);
  readonly loading = signal(false);
  readonly clearing = signal(false);
  readonly failed = signal<string | null>(null);
  readonly expanded = signal(new Set<number>());
  /** The Alert whose error was just copied. */
  readonly copied = signal<number | null>(null);
  /** A common error said in plain words, with what to do about it. */
  readonly explain = explainError;

  readonly activeOffcanvas = inject(NgbActiveOffcanvas);
  private readonly flowService = inject(FlowService);
  private readonly router = inject(Router);
  private flow?: AlertsFlow;

  get flowName(): string {
    return this.flow?.name ?? '';
  }

  /** Opens a drawer for a Flow; `onCleared` runs once its Alerts are cleared. */
  static open(offcanvas: NgbOffcanvas, flow: AlertsFlow, onCleared: () => void): void {
    const ref = offcanvas.open(FlowAlertsDrawerComponent, {
      position: 'end',
      ariaLabelledBy: 'flow-alerts-title',
      panelClass: 'flow-alerts-drawer',
    });
    const drawer: FlowAlertsDrawerComponent = ref.componentInstance;
    drawer.flow = flow;
    drawer.cleared.subscribe(onCleared);
    drawer.loadMore();
  }

  get hasMore(): boolean {
    return this.alerts().length < this.total();
  }

  loadMore(): void {
    if (!this.flow || this.loading()) {
      return;
    }
    this.loading.set(true);
    this.failed.set(null);
    this.flowService.getFlowAlertsPage(this.flow.id, this.alerts().length, PAGE_SIZE).subscribe({
      next: response => {
        this.total.set(response.body?.total ?? 0);
        this.alerts.update(alerts => [...alerts, ...(response.body?.messages ?? []).map(parseAlert)]);
        this.loading.set(false);
      },
      error: () => {
        this.failed.set("Couldn't load the alerts.");
        this.loading.set(false);
      },
    });
  }

  onScroll(event: Event): void {
    const list = event.target as HTMLElement;
    if (this.hasMore && list.scrollTop + list.clientHeight >= list.scrollHeight - 40) {
      this.loadMore();
    }
  }

  isLong(alert: FlowAlert): boolean {
    return alert.message.length > LONG_ERROR;
  }

  toggle(index: number): void {
    this.expanded.update(expanded => {
      const next = new Set(expanded);
      next.has(index) ? next.delete(index) : next.add(index);
      return next;
    });
  }

  /**
   * Copies an error. It is selected as well, so it can still be copied with Ctrl+C where the browser doesn't give the
   * page the clipboard.
   */
  copy(source: HTMLElement, index: number): void {
    const range = document.createRange();
    range.selectNodeContents(source);
    window.getSelection()?.removeAllRanges();
    window.getSelection()?.addRange(range);
    const copied = (): void => {
      this.copied.set(index);
      setTimeout(() => this.copied.update(current => (current === index ? null : current)), 2000);
    };
    // copying the selection works where the page has no clipboard permission, such as an embedded browser
    if (document.execCommand('copy')) {
      copied();
    } else {
      void navigator.clipboard?.writeText(source.textContent ?? '').then(copied, () => undefined);
    }
  }

  relative(alert: FlowAlert): string {
    return alert.at ? alert.at.fromNow() : '';
  }

  timestamp(alert: FlowAlert): string {
    return alert.at ? alert.at.format('YYYY-MM-DD HH:mm:ss') : '';
  }

  openFlow(): void {
    if (!this.flow) {
      return;
    }
    this.activeOffcanvas.dismiss();
    this.router.navigate(['/flow/editor', this.flow.id], {
      queryParams: { mode: 'edit', editor: this.flow.type || 'flow', id: this.flow.id },
    });
  }

  clear(): void {
    if (!this.flow) {
      return;
    }
    this.clearing.set(true);
    this.failed.set(null);
    this.flowService.clearFlowAlerts(this.flow.id).subscribe({
      next: () => {
        this.clearing.set(false);
        this.alerts.set([]);
        this.total.set(0);
        this.cleared.emit();
      },
      error: () => {
        this.clearing.set(false);
        this.failed.set("Couldn't clear the alerts.");
      },
    });
  }
}

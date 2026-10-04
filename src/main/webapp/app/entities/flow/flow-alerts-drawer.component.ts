import { Component, inject, output, signal } from '@angular/core';
import { Router } from '@angular/router';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgbActiveOffcanvas, NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import dayjs from 'dayjs/esm';

import { FlowService } from './flow.service';

const PAGE_SIZE = 10;

interface Alert {
  /** When the alert was written, or undefined when the line has no timestamp. */
  at?: dayjs.Dayjs;
  message: string;
}

/** The Flow a drawer shows the Alerts of. */
export interface AlertsFlow {
  id: number;
  name?: string;
  type?: string;
}

/**
 * A Flow's Alerts in a side drawer, newest first: relative times with the full timestamp on hover, long messages on
 * one line until expanded, Open Flow, and Clear, which clears them for everyone.
 */
@Component({
  selector: 'jhi-flow-alerts-drawer',
  templateUrl: './flow-alerts-drawer.component.html',
  styleUrl: './flow-alerts-drawer.component.scss',
  imports: [FontAwesomeModule],
})
export class FlowAlertsDrawerComponent {
  readonly cleared = output<void>();

  readonly alerts = signal<Alert[]>([]);
  readonly total = signal(0);
  readonly loading = signal(false);
  readonly clearing = signal(false);
  readonly failed = signal<string | null>(null);
  readonly expanded = signal(new Set<number>());

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

  toggle(index: number): void {
    this.expanded.update(expanded => {
      const next = new Set(expanded);
      next.has(index) ? next.delete(index) : next.add(index);
      return next;
    });
  }

  relative(alert: Alert): string {
    return alert.at ? alert.at.fromNow() : '';
  }

  timestamp(alert: Alert): string {
    return alert.at ? alert.at.format('YYYY-MM-DD HH:mm:ss Z') : '';
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

/** Reads an alert line, `2026-03-06 09:53:13 +0100 : Cannot store file`, into its time and message. */
function parseAlert(line: string): Alert {
  const separator = line.indexOf(' : ');
  if (separator > 0) {
    const at = dayjs(line.slice(0, separator), 'YYYY-MM-DD HH:mm:ss ZZ');
    if (at.isValid()) {
      return { at, message: line.slice(separator + 3) };
    }
  }
  return { message: line };
}

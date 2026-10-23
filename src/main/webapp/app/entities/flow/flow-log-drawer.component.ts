import { Component, ElementRef, computed, effect, inject, input, signal, untracked, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Router } from '@angular/router';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgbActiveOffcanvas, NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';

import { colorLog, logEntries } from 'app/admin/logviewer/log-display';
import { LogViewerLineValidationDirective } from 'app/admin/logviewer/logviewer-line-validation.directive';
import { LogViewerService } from 'app/admin/logviewer/logviewer.service';
import { SearchToolbar } from 'app/shared/filter';

/** The Flow a drawer shows the log of. */
export interface LogFlow {
  id: number;
  name?: string | null;
}

/**
 * A Flow's entries in the application log in a side drawer: what its Log Steps and Error Handler logged and when it was
 * started or stopped, newest at the bottom, with the filter and Refresh of the Log viewer. The visual editor also shows
 * it in a tab, given the Flow by its inputs.
 */
@Component({
  selector: 'jhi-flow-log-drawer',
  templateUrl: './flow-log-drawer.component.html',
  styleUrl: './flow-log-drawer.component.scss',
  imports: [FormsModule, FontAwesomeModule, LogViewerLineValidationDirective, SearchToolbar],
})
export class FlowLogDrawerComponent {
  readonly entries = signal<string[]>([]);
  readonly searchText = signal('');
  readonly loading = signal(false);
  readonly failed = signal<string | null>(null);
  readonly flow = signal<LogFlow | undefined>(undefined);
  readonly coloredLog = computed<SafeHtml>(() => this.sanitizer.bypassSecurityTrustHtml(colorLog(this.entries(), this.searchText())));

  /** Shown in a page rather than a drawer: the Flow to show the log of. */
  readonly flowId = input<number | null | undefined>();
  readonly flowName = input<string | null | undefined>();

  lines = 250;

  /** The drawer the log is shown in; null when it is shown in a page. */
  readonly activeOffcanvas = inject(NgbActiveOffcanvas, { optional: true });
  private readonly logViewerService = inject(LogViewerService);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly router = inject(Router);
  private readonly logArea = viewChild<ElementRef<HTMLElement>>('logArea');

  constructor() {
    effect(() => {
      const id = this.flowId();
      if (id) {
        untracked(() => {
          this.flow.set({ id, name: this.flowName() });
          this.getLogs();
        });
      }
    });
  }

  /** Opens a drawer with the log of a Flow. */
  static open(offcanvas: NgbOffcanvas, flow: LogFlow): void {
    const ref = offcanvas.open(FlowLogDrawerComponent, {
      position: 'end',
      ariaLabelledBy: 'flow-log-title',
      panelClass: 'flow-log-drawer',
    });
    const drawer: FlowLogDrawerComponent = ref.componentInstance;
    drawer.flow.set(flow);
    drawer.getLogs();
  }

  getLogs(): void {
    const flow = this.flow();
    if (!flow) {
      return;
    }
    this.loading.set(true);
    this.failed.set(null);
    this.logViewerService.getLogs(this.lines, flow.id).subscribe({
      next: response => {
        const log = response.body ?? '';
        this.entries.set(log ? logEntries(log) : []);
        this.loading.set(false);
        setTimeout(() => {
          const area = this.logArea()?.nativeElement;
          if (area) {
            area.scrollTop = area.scrollHeight;
          }
        });
      },
      error: () => {
        this.failed.set("Couldn't load the log.");
        this.loading.set(false);
      },
    });
  }

  openInLogViewer(): void {
    const flow = this.flow();
    if (!flow) {
      return;
    }
    this.activeOffcanvas?.dismiss();
    this.router.navigate(['/admin/logviewer'], { queryParams: { flowId: flow.id, name: flow.name || null } });
  }
}

import { ChangeDetectorRef, Component, OnInit, ViewChild, ElementRef, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { distinctUntilChanged, map } from 'rxjs';

import { SearchToolbar } from 'app/shared/filter';
import { LogViewerService } from './logviewer.service';
import { LogViewerLineValidationDirective } from './logviewer-line-validation.directive';
import { colorLog, logEntries } from './log-display';

@Component({
    standalone: true,
    selector: 'jhi-logviewer',
    templateUrl: './logviewer.component.html',
    styleUrl: './logviewer.component.scss',
    imports: [RouterModule, FormsModule, FontAwesomeModule, LogViewerLineValidationDirective, SearchToolbar],
})
export default class LogViewerComponent implements OnInit {
  @ViewChild('logArea', { static: false }) private logArea: ElementRef;

  public log = '';
  public logEntries: string[] = [];
  public lines: number;
  public coloredLog: SafeHtml = '';

  /** With a Flow, only the entries that Flow logged. */
  public flowId?: number;
  public flowName?: string;

  searchText = '';

  private readonly changeDetector = inject(ChangeDetectorRef);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  constructor(private logViewerService: LogViewerService) {}

  ngOnInit() {
    this.lines = 250;
    // The query params can be emitted again unchanged, as the navbar outlet settles; load the log once per Flow
    this.route.queryParamMap
      .pipe(
        map(params => [params.get('flowId'), params.get('name')] as const),
        distinctUntilChanged((a, b) => a[0] === b[0] && a[1] === b[1]),
      )
      .subscribe(([id, name]) => {
        const flowId = Number(id);
        this.flowId = flowId > 0 ? flowId : undefined;
        this.flowName = this.flowId ? (name ?? undefined) : undefined;
        this.getLogs();
      });
  }

  getLogs() {
    this.logViewerService.getLogs(this.lines, this.flowId).subscribe(res => {
      this.log = res.body ?? '';
      this.logEntries = logEntries(this.log);
      this.refreshDisplay();
      this.changeDetector.detectChanges();

      setTimeout(() => {
        try {
          this.logArea.nativeElement.scrollTop = this.logArea.nativeElement.scrollHeight;
        } catch (error) {}
      }, 0);
    });
  }

  /** Back to the whole application log. */
  showAll(): void {
    this.router.navigate([], { relativeTo: this.route, queryParams: {} });
  }

  onFilterChange(): void {
    this.refreshDisplay();
  }

  private refreshDisplay(): void {
    this.coloredLog = this.sanitizer.bypassSecurityTrustHtml(colorLog(this.logEntries, this.searchText));
  }
}

import { ChangeDetectorRef, Component, OnInit, ViewChild, ElementRef, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { LogViewerService } from './logviewer.service';
import { LogViewerLineValidationDirective } from './logviewer-line-validation.directive';

@Component({
  standalone: true,
  selector: 'jhi-logviewer',
  templateUrl: './logviewer.component.html',
  imports: [RouterModule, FormsModule, LogViewerLineValidationDirective],
})
export default class LogViewerComponent implements OnInit {
  @ViewChild('logArea', { static: false }) private logArea: ElementRef;

  public log = '';
  public logLines: string[] = [];
  public lines: number;
  public coloredLog: SafeHtml = '';

  searchText = '';

  private readonly changeDetector = inject(ChangeDetectorRef);
  private readonly sanitizer = inject(DomSanitizer);

  constructor(private logViewerService: LogViewerService) {}

  ngOnInit() {
    this.lines = 250;
    this.getLogs();
  }

  getLogs() {
    this.logViewerService.getLogs(this.lines).subscribe(res => {
      this.log = res.body ?? '';
      this.logLines = this.log.split(/\r?\n/);
      this.refreshDisplay();
      this.changeDetector.detectChanges();

      setTimeout(() => {
        try {
          this.logArea.nativeElement.scrollTop = this.logArea.nativeElement.scrollHeight;
        } catch (error) {}
      }, 0);
    });
  }

  onFilterChange(): void {
    this.refreshDisplay();
  }

  private refreshDisplay(): void {
    const search = this.searchText.toLocaleLowerCase();
    const lines = search
      ? this.logLines.filter(line => line.toLocaleLowerCase().includes(search))
      : this.logLines;

    const html = lines
      .map(line => {
        const escaped = this.escapeHtml(line);
        if (line.includes(' ERROR ')) {
          return `<span style="color: red">${escaped}</span>`;
        }
        if (line.includes(' WARN ')) {
          return `<span style="color: orange">${escaped}</span>`;
        }
        return escaped;
      })
      .join('\n');

    this.coloredLog = this.sanitizer.bypassSecurityTrustHtml(html);
  }

  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
}

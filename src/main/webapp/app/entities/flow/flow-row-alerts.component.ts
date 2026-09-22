import { Component, Input, TemplateRef, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'jhi-flow-row-alerts',
  templateUrl: './flow-row-alerts.component.html',
  imports: [CommonModule, FontAwesomeModule],
  host: { style: 'display: contents' },
})
export class FlowRowAlerts {
  @Input() flowName: string;
  @Input() flowError = false;
  @Input() flowErrorButton: string;
  @Input() numberOfAlerts = 0;
  @Input() alertsLoading = false;
  @Input() alertsLoadingMore = false;
  @Input() alertMessages: string[] = [];
  readonly alertsOpen = output<void>();
  readonly alertsScroll = output<Event>();

  constructor(private modalService: NgbModal) {}

  openError(content: TemplateRef<unknown>): void {
    this.modalService.open(content, { centered: true, size: 'lg' });
  }

  openAlerts(content: TemplateRef<unknown>): void {
    this.alertsOpen.emit();
    this.modalService.open(content, { centered: true, size: 'lg' });
  }
}

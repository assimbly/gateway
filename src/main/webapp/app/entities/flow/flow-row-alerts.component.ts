import { Component, Input, output } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

/**
 * The one badge of a Flow's Alerts, in its row and in the editor header: red Error while the Flow failed to start, stop
 * and so on, otherwise yellow Alerts, with their number. It opens the Alerts drawer, which says what went wrong.
 */
@Component({
  selector: 'jhi-flow-row-alerts',
  templateUrl: './flow-row-alerts.component.html',
  imports: [FontAwesomeModule],
  host: { style: 'display: contents' },
})
export class FlowRowAlerts {
  /** Whether the Flow failed the last time it was started, stopped and so on. */
  @Input() failed = false;
  @Input() numberOfAlerts = 0;
  readonly alertsOpen = output<void>();
}

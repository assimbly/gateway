import { Component, input } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { SendResult } from './send-state';

/** Feedback on the last send, shown directly under the toolbar of the Send pages. */
@Component({
  selector: 'jhi-send-result',
  imports: [FontAwesomeModule],
  templateUrl: './send-result.html',
})
export default class SendResultPanel {
  readonly result = input<SendResult | null>(null);
}

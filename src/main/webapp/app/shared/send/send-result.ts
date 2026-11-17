import { Component, input } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { SendResult } from './send-state';

/** Feedback on the last send, shown directly under the toolbar of the Send pages. */
@Component({
  selector: 'jhi-send-result',
  imports: [FontAwesomeModule, NgTemplateOutlet, RouterLink],
  templateUrl: './send-result.html',
})
export default class SendResultPanel {
  readonly result = input<SendResult | null>(null);

  /** The target before its link, e.g. "queue " of "queue TestQ". */
  beforeLink(result: SendResult): string {
    return result.target.slice(0, result.target.length - (result.link?.text.length ?? 0));
  }
}

import { Component, input, output } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

/**
 * Header of the Send pages (Flows > Send and Broker > Send): what is being sent where, and the actions
 * Back (only when the page was opened from a row), Upload and Send.
 */
@Component({
  selector: 'jhi-send-toolbar',
  imports: [FontAwesomeModule],
  templateUrl: './send-toolbar.html',
})
export default class SendToolbar {
  readonly title = input('Send message');
  readonly subtitle = input('');
  readonly showBack = input(false);
  readonly sending = input(false);
  /** Shows the Upload button, which uploads one file. */
  readonly uploadEnabled = input(true);

  readonly send = output<void>();
  readonly back = output<void>();
  readonly fileSelected = output<File>();
  onFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.fileSelected.emit(file);
    }
    // allows selecting the same file again
    input.value = '';
  }
}

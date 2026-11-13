import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import { Message } from 'app/shared/model/message.model';

@Component({
  selector: '[jhi-broker-message-browser-row]',
  templateUrl: './broker-message-browser-row.component.html',
  imports: [RouterModule],
})
export class BrokerMessageBrowserRowComponent {
  readonly message = input.required<Message>();

  messageRowID!: string;
}

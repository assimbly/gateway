import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

export type EndpointType = 'queue' | 'topic';

/**
 * Queues / Topics toggle shown in the toolbar of the endpoint list pages.
 * Queues and Topics are separate routes, presented in the sidebar as one "Endpoints" entry.
 */
@Component({
  selector: 'jhi-endpoint-type-switch',
  imports: [RouterLink],
  templateUrl: './endpoint-type-switch.html',
})
export default class EndpointTypeSwitch {
  readonly active = input.required<EndpointType>();
}

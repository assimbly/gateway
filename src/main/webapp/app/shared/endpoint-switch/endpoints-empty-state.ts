import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { EmptyState } from 'app/shared/empty-state';

import EndpointTypeSwitch, { type EndpointType } from './endpoint-type-switch';

const ABOUT_ENDPOINTS =
  'An Endpoint is a Queue or a Topic on your Broker: a named place where messages wait until a Flow or an application picks them up.';

/**
 * What the Queues and Topics pages show instead of their list when there is nothing to list: no Broker yet, a Broker
 * that is not running, or a running Broker without any Queue or Topic. The Queues / Topics switch stays above it.
 */
@Component({
  selector: 'jhi-endpoints-empty-state',
  imports: [RouterLink, FontAwesomeModule, EmptyState, EndpointTypeSwitch],
  templateUrl: './endpoints-empty-state.html',
})
export default class EndpointsEmptyState {
  readonly kind = input.required<EndpointType>();
  /** Whether a Broker is configured at all. */
  readonly brokerConfigured = input.required<boolean>();
  /** Whether the Broker answers. */
  readonly brokerRunning = input.required<boolean>();

  protected readonly about = ABOUT_ENDPOINTS;
  protected readonly label = computed(() => (this.kind() === 'queue' ? 'Queue' : 'Topic'));
}

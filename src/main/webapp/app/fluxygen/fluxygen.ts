import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

export const FLUXYGEN_URLS = {
  tryIt: 'https://fluxygen.com/try-it-yourself/',
  demo: 'https://fluxygen.com/schedule-demo/',
  pricing: 'https://fluxygen.com/pricing/',
  technology: 'https://fluxygen.com/fluxygen-technology/',
  product: 'https://fluxygen.com/product/',
  academy: 'https://academy.fluxygen.com/',
} as const;

/** What Fluxygen is, what it adds to Assimbly and how to move the Flows of this Gateway there. */
@Component({
  selector: 'jhi-fluxygen',
  templateUrl: './fluxygen.html',
  styleUrl: './fluxygen.scss',
  imports: [RouterLink, FontAwesomeModule],
})
export default class Fluxygen {
  readonly urls = FLUXYGEN_URLS;

  /** The parts of the platform, Assimbly's own first. */
  readonly stack = [
    { name: 'Assimbly Integration', detail: 'Camel and DIL runtime', engine: true },
    { name: 'Assimbly Broker', detail: 'ActiveMQ, set up for you', engine: true },
    { name: 'Web UI', detail: 'A new visual editor', engine: false },
    { name: 'Reverse proxy', detail: 'Nginx in front', engine: false },
    { name: 'Elastic', detail: 'Tracing, logs and metrics', engine: false },
    { name: 'Report service', detail: 'Gathers the metrics', engine: false },
  ];

  readonly managed = [
    'Managed hosting in containers, also fully private',
    'Managed upgrades and long-term support (LTS) versions',
    'Support from the people who build Assimbly',
    'Monitoring with Grafana',
    'Hardened, production-ready security',
    'Fluxygen Academy: courses and docs',
  ];

  readonly features = [
    'Lifecycle and versioning of Flows',
    'Separate test and production environments',
    'Tenant variables and multi-tenant management',
    'A powerful visual editor, Flow templates and custom steps',
    'Flow grouping, tracing and an Error Registry',
    'ErrorHandler as a Flow',
    'Multi-factor authentication and mutual TLS',
  ];
}

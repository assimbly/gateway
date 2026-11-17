import { Component, inject, signal } from '@angular/core';
import { forkJoin } from 'rxjs';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { FlowService } from 'app/entities/flow/flow.service';
import { FluxygenExportDialogComponent } from 'app/entities/flow/fluxygen-export-dialog.component';
import { IntegrationService } from 'app/entities/integration/integration.service';

export const FLUXYGEN_URLS = {
  tryIt: 'https://fluxygen.com/try-it-yourself/',
  demo: 'https://fluxygen.com/schedule-demo/',
  pricing: 'https://fluxygen.com/pricing/',
  technology: 'https://fluxygen.com/fluxygen-technology/',
  product: 'https://fluxygen.com/product/',
  academy: 'https://academy.fluxygen.com/',
} as const;

/** What Fluxygen is, what it adds to Assimbly and how to move the Flows of this Gateway there, with Export for Fluxygen. */
@Component({
  selector: 'jhi-fluxygen',
  templateUrl: './fluxygen.html',
  styleUrl: './fluxygen.scss',
  imports: [FontAwesomeModule],
})
export default class Fluxygen {
  readonly urls = FLUXYGEN_URLS;
  /** The Gateway whose Flows Export for Fluxygen exports; undefined until it is known. */
  readonly integrationId = signal<number | undefined>(undefined);

  private readonly modalService = inject(NgbModal);

  constructor() {
    // The Gateway this app runs as, picked as the Flows list does: by its name, the first one for "default"
    forkJoin([inject(FlowService).getIntegrationName(), inject(IntegrationService).query()]).subscribe({
      next: ([name, response]) => {
        const integrations = response.body ?? [];
        const own =
          name.body === 'default' ? integrations[0] : (integrations.find(integration => integration.name === name.body) ?? integrations[0]);
        this.integrationId.set(own?.id);
      },
      error: () => undefined,
    });
  }

  openExport(): void {
    const integrationId = this.integrationId();
    if (integrationId !== undefined) {
      FluxygenExportDialogComponent.open(this.modalService, integrationId);
    }
  }

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

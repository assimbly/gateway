import { Injectable, computed, effect, inject, signal, untracked } from '@angular/core';

import { AccountService } from 'app/core/auth';
import { EventManager } from 'app/core/util/event-manager.service';
import { EnvironmentType, IIntegration } from 'app/shared/model/integration.model';
import { IntegrationService } from './integration.service';

/**
 * The stage of the Gateway, such as Production, for the badge beside the brand and for the confirmations a live
 * Gateway asks. Read after sign-in and again whenever a Gateway is saved, imported or deleted.
 */
@Injectable({ providedIn: 'root' })
export class GatewayStageService {
  /** The stage, or null while signed out or when Gateways of different stages are configured. */
  readonly stage = signal<EnvironmentType | null>(null);
  readonly production = computed(() => this.stage() === EnvironmentType.PRODUCTION);
  readonly label = computed(() => enumLabel(this.stage()));
  /** The badge's colour: danger on Production, neutral on the other stages. */
  readonly tone = computed(() => (this.production() ? 'text-bg-danger' : 'text-bg-secondary'));

  private readonly integrationService = inject(IntegrationService);

  constructor() {
    const account = inject(AccountService).account;
    effect(() => {
      if (account()) {
        untracked(() => this.load());
      } else {
        this.stage.set(null);
      }
    });
    inject(EventManager).subscribe('integrationListModification', () => this.load());
  }

  load(): void {
    this.integrationService.query().subscribe({
      next: response => this.stage.set(stageOf(response.body ?? [])),
      error: () => this.stage.set(null),
    });
  }
}

/** The one stage all Gateways share; null when there are none or their stages differ. */
export function stageOf(integrations: IIntegration[]): EnvironmentType | null {
  const stages = new Set(integrations.map(integration => integration.stage).filter(stage => !!stage));
  return stages.size === 1 ? [...stages][0]! : null;
}

/** An enum value in title case, as the UI shows it: PRODUCTION becomes Production. */
export function enumLabel(value: string | null | undefined): string {
  return value ? value.charAt(0) + value.slice(1).toLowerCase() : '';
}

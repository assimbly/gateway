import { HttpResponse } from '@angular/common/http';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { AccountService } from 'app/core/auth';
import { EventManager, EventWithContent } from 'app/core/util/event-manager.service';
import { EnvironmentType, IIntegration } from 'app/shared/model/integration.model';

import { GatewayStageService, enumLabel, stageOf } from './gateway-stage.service';
import { IntegrationService } from './integration.service';

describe('Gateway stage', () => {
  it('takes the stage all Gateways share', () => {
    expect(stageOf([{ stage: EnvironmentType.PRODUCTION }, { stage: EnvironmentType.PRODUCTION }])).toBe(EnvironmentType.PRODUCTION);
    expect(stageOf([{ stage: EnvironmentType.TEST }, {}])).toBe(EnvironmentType.TEST);
  });

  it('shows no stage without Gateways, or for Gateways of different stages', () => {
    expect(stageOf([])).toBeNull();
    expect(stageOf([{ stage: EnvironmentType.TEST }, { stage: EnvironmentType.PRODUCTION }])).toBeNull();
  });

  it('says an enum value in title case', () => {
    expect(enumLabel('PRODUCTION')).toBe('Production');
    expect(enumLabel('FULL')).toBe('Full');
    expect(enumLabel(undefined)).toBe('');
  });

  describe('the service', () => {
    const account = signal<object | null>(null);
    let gateways: IIntegration[];
    let query: jest.Mock;

    beforeEach(() => {
      account.set(null);
      gateways = [{ id: 1, stage: EnvironmentType.DEVELOPMENT }];
      query = jest.fn(() => of(new HttpResponse({ body: gateways })));
      TestBed.configureTestingModule({
        providers: [
          { provide: AccountService, useValue: { account } },
          { provide: IntegrationService, useValue: { query } },
        ],
      });
    });

    it('reads the stage after sign-in and forgets it after sign-out', () => {
      const service = TestBed.inject(GatewayStageService);
      TestBed.tick();
      expect(query).not.toHaveBeenCalled();
      expect(service.stage()).toBeNull();

      account.set({ login: 'admin' });
      TestBed.tick();
      expect(service.label()).toBe('Development');
      expect(service.production()).toBe(false);

      account.set(null);
      TestBed.tick();
      expect(service.stage()).toBeNull();
    });

    it('follows a Gateway that is saved with another stage', () => {
      const service = TestBed.inject(GatewayStageService);
      account.set({ login: 'admin' });
      TestBed.tick();

      gateways = [{ id: 1, stage: EnvironmentType.PRODUCTION }];
      TestBed.inject(EventManager).broadcast(new EventWithContent('integrationListModification', 'Saved a Gateway'));

      expect(service.production()).toBe(true);
    });
  });
});

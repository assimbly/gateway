import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ComponentFixture, TestBed, inject } from '@angular/core/testing';

import { of, throwError } from 'rxjs';

import { Account, AccountService } from 'app/core/auth';

import { Session } from './session.model';
import Sessions from './sessions';
import { SessionsService } from './sessions.service';

describe('Sessions', () => {
  let fixture: ComponentFixture<Sessions>;
  let comp: Sessions;
  const sessions: Session[] = [new Session('xxxxxx==', new Date(2015, 10, 15), '0:0:0:0:0:0:0:1', 'Mozilla/5.0')];
  const account: Account = {
    firstName: 'John',
    lastName: 'Doe',
    activated: true,
    email: 'john.doe@mail.com',
    langKey: 'en',
    login: 'john',
    authorities: [],
    imageUrl: '',
  };

  beforeEach(() => {
    fixture = TestBed.configureTestingModule({
      imports: [Sessions],
      providers: [
        {
          provide: AccountService,
          useValue: {},
        },
      ],
    })
      .overrideTemplate(Sessions, '')
      .createComponent(Sessions);
    comp = fixture.componentInstance;
  });

  it('should define its initial state', inject(
    [AccountService, SessionsService],
    (mockAccountService: AccountService, service: SessionsService) => {
      mockAccountService.identity = vi.fn(() => of(account));
      vi.spyOn(service, 'findAll').mockReturnValue(of(sessions));

      comp.ngOnInit();

      expect(mockAccountService.identity).toHaveBeenCalled();
      expect(service.findAll).toHaveBeenCalled();
      expect(comp.success).toBe(false);
      expect(comp.error).toBe(false);
      expect(comp.account).toEqual(account);
      expect(comp.sessions).toEqual(sessions);
    },
  ));

  it('should call delete on Sessions to invalidate a session', inject(
    [AccountService, SessionsService],
    (mockAccountService: AccountService, service: SessionsService) => {
      mockAccountService.identity = vi.fn(() => of(account));
      vi.spyOn(service, 'findAll').mockReturnValue(of(sessions));
      vi.spyOn(service, 'delete').mockReturnValue(of({}));

      comp.ngOnInit();
      comp.invalidate('xyz');

      expect(service.delete).toHaveBeenCalledWith('xyz');
    },
  ));

  it('should call delete on Sessions and notify of error', inject(
    [AccountService, SessionsService],
    (mockAccountService: AccountService, service: SessionsService) => {
      mockAccountService.identity = vi.fn(() => of(account));
      vi.spyOn(service, 'findAll').mockReturnValue(of(sessions));
      vi.spyOn(service, 'delete').mockReturnValue(throwError(Error));

      comp.ngOnInit();
      comp.invalidate('xyz');

      expect(comp.success).toBe(false);
      expect(comp.error).toBe(true);
    },
  ));

  it('should call notify of success upon session invalidation', inject(
    [AccountService, SessionsService],
    (mockAccountService: AccountService, service: SessionsService) => {
      mockAccountService.identity = vi.fn(() => of(account));
      vi.spyOn(service, 'findAll').mockReturnValue(of(sessions));
      vi.spyOn(service, 'delete').mockReturnValue(of({}));

      comp.ngOnInit();
      comp.invalidate('xyz');

      expect(comp.error).toBe(false);
      expect(comp.success).toBe(true);
    },
  ));
});

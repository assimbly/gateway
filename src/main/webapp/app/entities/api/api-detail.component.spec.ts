import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap, provideRouter } from '@angular/router';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

import { of } from 'rxjs';

import { fontAwesomeIcons } from 'app/config/font-awesome-icons';

import { ApiDetailComponent } from './api-detail.component';
import { IApi } from './api.model';
import { ApiService } from './api.service';
import { HandlerFlowsService } from './handler-flows.service';

describe('ApiDetailComponent', () => {
  it('puts the cursor in the name of a new API', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { paramMap: of(convertToParamMap({ id: 'new' })) } },
        { provide: ApiService, useValue: {} },
        { provide: HandlerFlowsService, useValue: {} },
      ],
    });
    TestBed.inject(FaIconLibrary).addIcons(...fontAwesomeIcons);
    const fixture = TestBed.createComponent(ApiDetailComponent);
    document.body.appendChild(fixture.nativeElement);

    fixture.detectChanges();
    await fixture.whenStable();

    expect(document.activeElement?.id).toBe('api-name');
    fixture.nativeElement.remove();
  });

  describe('a saved API', () => {
    const api: IApi = {
      id: 5,
      name: 'Customers',
      basePath: '/customers',
      operations: [
        {
          id: 8,
          method: 'GET',
          path: '/',
          fullPath: '/customers',
          handlerFlowId: 40,
          handlerFlowName: 'GET /customers',
          parameters: [],
          declaredResponses: [],
        },
      ],
    };
    let fixture: ComponentFixture<ApiDetailComponent>;
    let apiService: Record<string, jest.Mock>;
    let answer: string | undefined;
    let open: jest.SpyInstance;

    beforeEach(() => {
      apiService = {
        find: jest.fn(() => of(api)),
        update: jest.fn((saved: IApi) => of(saved)),
        delete: jest.fn(() => of({})),
        handlers: jest.fn(() => of({})),
        listenerUrl: jest.fn(() => of('http://localhost:9000')),
      };
      TestBed.configureTestingModule({
        providers: [
          provideRouter([]),
          { provide: ActivatedRoute, useValue: { paramMap: of(convertToParamMap({ id: '5' })) } },
          { provide: ApiService, useValue: apiService },
          { provide: HandlerFlowsService, useValue: { states: () => of(new Map()) } },
        ],
      });
      TestBed.inject(FaIconLibrary).addIcons(...fontAwesomeIcons);
      answer = undefined;
      open = jest
        .spyOn(TestBed.inject(NgbModal), 'open')
        .mockImplementation(
          () => ({ componentInstance: {}, result: answer ? Promise.resolve(answer) : Promise.reject(new Error('closed')) }) as NgbModalRef,
        );
      jest.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
      fixture = TestBed.createComponent(ApiDetailComponent);
      fixture.detectChanges();
    });

    const dialog = (): { title: string; message: string } => open.mock.results[0].value.componentInstance;

    it("asks in the app's dialog before it deletes the API", async () => {
      answer = 'cancel';
      fixture.componentInstance.deleteApi();
      await Promise.resolve();
      expect(dialog().title).toBe('Delete API');
      expect(dialog().message).toBe('Delete the API Customers? Its 1 Operation and its Handler Flow are deleted too.');
      expect(apiService.delete).not.toHaveBeenCalled();

      answer = 'delete';
      fixture.componentInstance.deleteApi();
      await Promise.resolve();
      expect(apiService.delete).toHaveBeenCalledWith(5);
    });

    it('leaves at once without changes, and asks with changes', async () => {
      expect(await fixture.componentInstance.canDeactivate()).toBe(true);
      expect(open).not.toHaveBeenCalled();

      fixture.componentInstance.form.controls.name.setValue('Clients');
      fixture.componentInstance.form.markAsDirty();
      answer = 'stay';
      expect(await fixture.componentInstance.canDeactivate()).toBe(false);
      expect(dialog().title).toBe('Unsaved changes');

      answer = 'save';
      expect(await fixture.componentInstance.canDeactivate()).toBe(true);
      expect(apiService.update).toHaveBeenCalledWith(expect.objectContaining({ id: 5, name: 'Clients' }));
      expect(fixture.componentInstance.form.pristine).toBe(true);
    });

    it('saves the changed API on Ctrl+S', () => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 's', ctrlKey: true, cancelable: true }));
      expect(apiService.update).not.toHaveBeenCalled();

      fixture.componentInstance.form.controls.description.setValue('Our customers');
      fixture.componentInstance.form.markAsDirty();
      fixture.detectChanges();
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 's', ctrlKey: true, cancelable: true }));

      expect(apiService.update).toHaveBeenCalledWith(expect.objectContaining({ description: 'Our customers' }));
    });

    it('opens a Handler Flow so that the editor comes back to this API', () => {
      const link: HTMLAnchorElement = fixture.nativeElement.querySelector('[data-tour="operation-handler-flow"]');

      expect(new URL(link.href).searchParams.get('returnTo')).toBe('/rest-apis/5');
    });
  });
});

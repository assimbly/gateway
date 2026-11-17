import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { FlowEditorComponent } from './flow-editor.component';
import { FlowEditorEsbComponent } from './flow-editor-esb.component';

describe('Leaving the Flow editor', () => {
  /** The editor page whose dialog answers with `choice`, around an editor that has unsaved changes or not. */
  function page(choice: string | undefined, unsaved = true): { component: FlowEditorComponent; open: jest.Mock; saveBeforeLeaving: jest.Mock } {
    const open = jest.fn(() => ({ componentInstance: {}, result: choice === undefined ? Promise.reject('dismissed') : Promise.resolve(choice) }));
    TestBed.configureTestingModule({
      providers: [
        { provide: NgbModal, useValue: { open } },
        { provide: ActivatedRoute, useValue: {} },
        { provide: Router, useValue: {} },
      ],
    });
    const component = TestBed.runInInjectionContext(() => new FlowEditorComponent());
    const saveBeforeLeaving = jest.fn(() => Promise.resolve(true));
    component.esbEditor = { hasUnsavedChanges: unsaved, saveBeforeLeaving } as unknown as FlowEditorEsbComponent;
    return { component, open, saveBeforeLeaving };
  }

  it('leaves without asking when everything is saved', async () => {
    const { component, open } = page('stay', false);

    expect(await component.canDeactivate()).toBe(true);
    expect(open).not.toHaveBeenCalled();
  });

  it('stays when the user keeps editing or closes the dialog', async () => {
    expect(await page('stay').component.canDeactivate()).toBe(false);
    TestBed.resetTestingModule();
    expect(await page(undefined).component.canDeactivate()).toBe(false);
  });

  it('leaves without saving when the user says so', async () => {
    const { component, saveBeforeLeaving } = page('leave');

    expect(await component.canDeactivate()).toBe(true);
    expect(saveBeforeLeaving).not.toHaveBeenCalled();
  });

  it('saves first, and leaves only when the save worked', async () => {
    const { component, saveBeforeLeaving } = page('save');

    expect(await component.canDeactivate()).toBe(true);
    expect(saveBeforeLeaving).toHaveBeenCalled();

    saveBeforeLeaving.mockResolvedValue(false);
    expect(await component.canDeactivate()).toBe(false);
  });
});

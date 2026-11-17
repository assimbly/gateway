import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { ConfirmDialogComponent, confirmOnProduction } from './confirm-dialog.component';

describe('Confirm on production', () => {
  function modalAnswering(choice: string | undefined): { modal: NgbModal; dialog: Partial<ConfirmDialogComponent> } {
    const dialog: Partial<ConfirmDialogComponent> = {};
    const modal = {
      open: jest.fn(() => ({
        componentInstance: dialog,
        result: choice ? Promise.resolve(choice) : Promise.reject(new Error('dismissed')),
      })),
    } as unknown as NgbModal;
    return { modal, dialog };
  }

  it('stops at once on any other stage', () => {
    const { modal } = modalAnswering(undefined);
    const proceed = jest.fn();

    confirmOnProduction(modal, false, 'stop', 'Orders', proceed);

    expect(proceed).toHaveBeenCalled();
    expect(modal.open).not.toHaveBeenCalled();
  });

  it('asks before it stops a Flow on Production', async () => {
    const { modal, dialog } = modalAnswering('stop');
    const proceed = jest.fn();

    confirmOnProduction(modal, true, 'stop', 'Orders', proceed);
    expect(proceed).not.toHaveBeenCalled();
    await Promise.resolve();

    expect(dialog.title).toBe('Stop Orders?');
    expect(dialog.message).toBe('Messages stop being processed until the Flow is started again.');
    expect(dialog.choices!.map(choice => choice.label)).toEqual(['Cancel', 'Stop']);
    expect(proceed).toHaveBeenCalled();
  });

  it.each(['cancel', undefined])('leaves a Flow on Production running when the answer is %s', async choice => {
    const { modal, dialog } = modalAnswering(choice);
    const proceed = jest.fn();

    confirmOnProduction(modal, true, 'restart', 'Orders', proceed);
    await new Promise(resolve => setTimeout(resolve));

    expect(dialog.title).toBe('Restart Orders?');
    expect(proceed).not.toHaveBeenCalled();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FaIconLibrary } from '@fortawesome/angular-fontawesome';

import { fontAwesomeIcons } from 'app/config/font-awesome-icons';

import SendToolbar from './send-toolbar';
import { SendState, sendErrorText } from './send-state';

describe('SendToolbar', () => {
  let fixture: ComponentFixture<SendToolbar>;
  let comp: SendToolbar;

  beforeEach(() => {
    TestBed.inject(FaIconLibrary).addIcons(...fontAwesomeIcons);
    fixture = TestBed.createComponent(SendToolbar);
    comp = fixture.componentInstance;
    fixture.detectChanges();
  });

  const el = () => fixture.nativeElement as HTMLElement;
  const buttonLabels = () => Array.from(el().querySelectorAll('button')).map(b => b.textContent?.trim());

  it('shows Upload and Send, and Back only when asked', () => {
    expect(buttonLabels()).toEqual(['Upload', 'Send']);

    fixture.componentRef.setInput('showBack', true);
    fixture.detectChanges();

    expect(buttonLabels()).toEqual(['Back', 'Upload', 'Send']);
  });

  it('emits send, and disables the button while sending', () => {
    const send = jest.fn();
    comp.send.subscribe(send);

    (el().querySelector('button.btn-fx-primary') as HTMLButtonElement).click();
    expect(send).toHaveBeenCalledTimes(1);

    fixture.componentRef.setInput('sending', true);
    fixture.detectChanges();

    const button = el().querySelector('button.btn-fx-primary') as HTMLButtonElement;
    expect(button.disabled).toBe(true);
    expect(button.textContent).toContain('Sending');
  });

  it('emits the selected file and lets the same file be selected again', () => {
    const emitted: File[] = [];
    comp.fileSelected.subscribe(file => emitted.push(file));
    const file = new File(['x'], 'x.txt');
    const input = { files: [file], value: 'x.txt' } as unknown as HTMLInputElement;

    comp.onFile({ target: input } as unknown as Event);

    expect(emitted).toEqual([file]);
    expect(input.value).toBe('');
  });

  it('uploads only one file, and has no directory upload', () => {
    const emitted: File[] = [];
    comp.fileSelected.subscribe(file => emitted.push(file));
    const files = [new File(['a'], 'a.txt'), new File(['b'], 'b.txt')];

    comp.onFile({ target: { files, value: '' } } as unknown as Event);

    expect(emitted).toEqual([files[0]]);
    const input = el().querySelector('input[type=file]') as HTMLInputElement;
    expect(input.multiple).toBe(false);
    expect(input.hasAttribute('webkitdirectory')).toBe(false);
  });
});

describe('SendState', () => {
  it('is sending until every message has been answered, then success or failed', () => {
    const state = new SendState();
    state.start(2, 'queue q');
    expect(state.sending()).toBe(true);

    state.succeed();
    expect(state.sending()).toBe(true);

    state.succeed();
    expect(state.sending()).toBe(false);
    expect(state.result()?.status).toBe('success');
  });

  it('fails when one message failed and keeps the error', () => {
    const state = new SendState();
    state.start(2, 'queue q');

    state.succeed();
    state.fail({ error: 'boom' });

    expect(state.result()).toEqual(expect.objectContaining({ status: 'failed', failed: 1, succeeded: 1, error: 'boom' }));
  });

  it('can be reset', () => {
    const state = new SendState();
    state.start(1, 'queue q');

    state.reset();

    expect(state.result()).toBeNull();
    expect(state.sending()).toBe(false);
  });

  it('turns errors into text', () => {
    expect(sendErrorText({ name: 'TimeoutError' }, 5000)).toContain('did not answer within 5 seconds');
    expect(sendErrorText({ error: 'text' })).toBe('text');
    expect(sendErrorText({ error: { message: 'nested' } })).toBe('nested');
    expect(sendErrorText({ message: 'plain' })).toBe('plain');
    expect(sendErrorText('direct')).toBe('direct');
    expect(sendErrorText(undefined)).toBe('Unknown error');
  });
});

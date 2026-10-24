import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { isPlainKey, isRunShortcut, isSaveShortcut, isStopShortcut, isTypingTarget } from './keyboard';
import { SaveShortcutDirective } from './save-shortcut.directive';

@Component({
  imports: [SaveShortcutDirective],
  template: `
    <form (jhiSaveShortcut)="saves = saves + 1" [saveShortcutDisabled]="disabled()">
      <input id="name" />
    </form>
  `,
})
class TestHost {
  saves = 0;
  disabled = signal(false);
}

const ctrlS = (init: KeyboardEventInit = {}): KeyboardEvent =>
  new KeyboardEvent('keydown', { key: 's', ctrlKey: true, bubbles: true, cancelable: true, ...init });

describe('SaveShortcutDirective', () => {
  let fixture: ComponentFixture<TestHost>;
  let openModals = false;

  beforeEach(() => {
    openModals = false;
    TestBed.configureTestingModule({
      providers: [{ provide: NgbModal, useValue: { hasOpenModals: () => openModals } }],
    });
    fixture = TestBed.createComponent(TestHost);
    fixture.detectChanges();
  });

  afterEach(() => document.querySelectorAll('ngb-modal-window').forEach(window => window.remove()));

  it('saves on Ctrl+S and Cmd+S, also while typing, and keeps the browser from saving the page', () => {
    const event = ctrlS();
    fixture.nativeElement.querySelector('#name').dispatchEvent(event);
    document.dispatchEvent(ctrlS({ ctrlKey: false, metaKey: true }));

    expect(fixture.componentInstance.saves).toBe(2);
    expect(event.defaultPrevented).toBe(true);
  });

  it('ignores other keys and Ctrl+Shift+S', () => {
    document.dispatchEvent(ctrlS({ key: 'z' }));
    document.dispatchEvent(ctrlS({ shiftKey: true }));
    document.dispatchEvent(ctrlS({ ctrlKey: false }));

    expect(fixture.componentInstance.saves).toBe(0);
  });

  it('does not save while disabled, but still keeps the browser from saving the page', () => {
    fixture.componentInstance.disabled.set(true);
    fixture.detectChanges();
    const event = ctrlS();
    document.dispatchEvent(event);

    expect(fixture.componentInstance.saves).toBe(0);
    expect(event.defaultPrevented).toBe(true);
  });

  it('leaves saving to the dialog while one is open', () => {
    openModals = true;
    document.body.appendChild(document.createElement('ngb-modal-window'));
    document.dispatchEvent(ctrlS());

    expect(fixture.componentInstance.saves).toBe(0);
  });

  it('saves a form inside the frontmost dialog', () => {
    openModals = true;
    const window = document.createElement('ngb-modal-window');
    window.appendChild(fixture.nativeElement);
    document.body.appendChild(window);
    document.dispatchEvent(ctrlS());

    expect(fixture.componentInstance.saves).toBe(1);
  });
});

describe('keyboard helpers', () => {
  it('knows where keys type text', () => {
    const editor = document.createElement('div');
    editor.className = 'CodeMirror';
    const line = document.createElement('span');
    editor.appendChild(line);

    expect(isTypingTarget(document.createElement('input'))).toBe(true);
    expect(isTypingTarget(line)).toBe(true);
    expect(isTypingTarget(document.createElement('button'))).toBe(false);
    expect(isTypingTarget(null)).toBe(false);
  });

  it('tells a plain key from one with a modifier', () => {
    expect(isPlainKey(new KeyboardEvent('keydown', { key: 'n' }), 'n')).toBe(true);
    expect(isPlainKey(new KeyboardEvent('keydown', { key: 'n', ctrlKey: true }), 'n')).toBe(false);
    expect(isSaveShortcut(new KeyboardEvent('keydown', { key: 'S', metaKey: true }))).toBe(true);
  });

  it('tells Run (Ctrl+Enter) from Stop (Ctrl+Shift+Enter)', () => {
    const enter = (init: KeyboardEventInit): KeyboardEvent => new KeyboardEvent('keydown', { key: 'Enter', ...init });

    expect(isRunShortcut(enter({ ctrlKey: true }))).toBe(true);
    expect(isRunShortcut(enter({ metaKey: true }))).toBe(true);
    expect(isRunShortcut(enter({ ctrlKey: true, shiftKey: true }))).toBe(false);
    expect(isRunShortcut(enter({}))).toBe(false);
    expect(isStopShortcut(enter({ ctrlKey: true, shiftKey: true }))).toBe(true);
    expect(isStopShortcut(enter({ ctrlKey: true }))).toBe(false);
    expect(isStopShortcut(enter({ ctrlKey: true, shiftKey: true, altKey: true }))).toBe(false);
  });
});

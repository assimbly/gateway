import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { provideTranslateService } from '@ngx-translate/core';

import { fontAwesomeIcons } from 'app/config/font-awesome-icons';

import SendMessageEditor from './send-message-editor';

describe('SendMessageEditor', () => {
  let fixture: ComponentFixture<SendMessageEditor>;
  let comp: SendMessageEditor;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideTranslateService(), provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    TestBed.inject(FaIconLibrary).addIcons(...fontAwesomeIcons);
    fixture = TestBed.createComponent(SendMessageEditor);
    comp = fixture.componentInstance;
    fixture.detectChanges();
  });

  const tabs = () => Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('a[ngbNavLink]')).map(a => a.textContent?.replace(/\s+/g, ' ').trim());

  it('has a Body and a Headers tab, and no separate tab for JMS headers', () => {
    expect(tabs()).toEqual(['Body', 'Headers']);
  });

  it('counts the headers that have a key on the Headers tab', () => {
    comp.headers.set([
      { key: 'a', value: '1' },
      { key: '', value: 'ignored' },
      { key: 'b', value: '2' },
    ]);
    fixture.detectChanges();

    expect(tabs()[1]).toBe('Headers 2');
  });

  it('always shows the line numbers of the body editor', () => {
    const options = comp.bodyEditorOptions();

    expect(options.lineNumbers).toBe(true);
    expect(options.gutters).toEqual(['CodeMirror-linenumbers']);
    // the same object is reused, otherwise the editor is re-configured on every change detection
    expect(comp.bodyEditorOptions()).toBe(options);
  });

  it('changes the editor options when the mode changes', () => {
    const options = comp.bodyEditorOptions();

    comp.bodyMode.set('json');

    expect(comp.bodyEditorOptions()).not.toBe(options);
    expect(comp.bodyEditorOptions().mode).toBe('json');
  });

  it('replaces the body with a dropped file and detects its mode', async () => {
    const file = new File(['{"a":1}'], 'a.json');
    const event = { preventDefault: jest.fn(), dataTransfer: { files: [file] } } as unknown as DragEvent;

    await comp.drop(event);

    expect(comp.body()).toBe('{"a":1}');
    expect(comp.bodyMode()).toBe('json');
  });
});

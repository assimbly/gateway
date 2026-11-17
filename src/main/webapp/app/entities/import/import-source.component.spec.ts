import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FaIconLibrary } from '@fortawesome/angular-fontawesome';

import { fontAwesomeIcons } from 'app/config/font-awesome-icons';

import { ImportSourceComponent } from './import-source.component';

// jsdom can't measure text, which CodeMirror does
Range.prototype.getBoundingClientRect = () => ({ x: 0, y: 0, width: 0, height: 0, top: 0, left: 0, right: 0, bottom: 0 }) as DOMRect;
Range.prototype.getClientRects = () => ({ length: 0, item: () => null, [Symbol.iterator]: [][Symbol.iterator] }) as unknown as DOMRectList;

async function waitFor(done: () => boolean): Promise<void> {
  for (let attempt = 0; attempt < 100 && !done(); attempt++) {
    await new Promise(resolve => setTimeout(resolve, 10));
  }
}

describe('Import source', () => {
  let fixture: ComponentFixture<ImportSourceComponent>;
  let source: ImportSourceComponent;

  beforeEach(() => {
    TestBed.inject(FaIconLibrary).addIcons(...fontAwesomeIcons);
    fixture = TestBed.createComponent(ImportSourceComponent);
    source = fixture.componentInstance;
    fixture.componentRef.setInput('kind', 'a script');
    fixture.detectChanges();
  });

  it('takes the text and name of a file that is chosen, and says which file', async () => {
    const chosen = jest.fn();
    source.fileChosen.subscribe(chosen);
    const file = new File(['println 1'], 'job.groovy');

    await source.load(file);
    fixture.detectChanges();

    expect(source.text()).toBe('println 1');
    expect(source.fileName()).toBe('job.groovy');
    expect(chosen).toHaveBeenCalledWith(file);
    expect(fixture.nativeElement.querySelector('.import-drop__hint').textContent).toContain('job.groovy');
  });

  it('takes a file that is dropped', async () => {
    const file = new File(['<route/>'], 'r.xml');
    const event = { preventDefault: jest.fn(), dataTransfer: { files: [file] } } as unknown as DragEvent;

    source.onDrop(event);
    await waitFor(() => source.fileName() !== undefined);

    expect(event.preventDefault).toHaveBeenCalled();
    expect(source.text()).toBe('<route/>');
    expect(source.fileName()).toBe('r.xml');
  });

  it('marks where a file can be dropped while one is dragged over', () => {
    source.onDragOver({ preventDefault: jest.fn(), stopPropagation: jest.fn() } as unknown as DragEvent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.import-drop').classList).toContain('import-drop--active');

    source.onDragLeave();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.import-drop').classList).not.toContain('import-drop--active');
  });

  it('refuses a file that is too large, and keeps what was there', async () => {
    fixture.componentRef.setInput('maxBytes', 4);
    source.text.set('kept');

    await source.load(new File(['123456789'], 'big.xml'));

    expect(source.problem()).toContain('big.xml is larger than');
    expect(source.text()).toBe('kept');
    expect(source.fileName()).toBeUndefined();
  });

  it('forgets the file name once the text is typed over', async () => {
    await source.load(new File(['a'], 'a.xml'));

    source.onTyped('b');

    expect(source.text()).toBe('b');
    expect(source.fileName()).toBeUndefined();
  });

  it('shows the text in a code editor with line numbers', () => {
    expect(fixture.nativeElement.querySelector('ngx-codemirror')).not.toBeNull();
    expect(source.editorOptions()['lineNumbers']).toBe(true);
    expect(source.editorOptions()['gutters']).toEqual(['CodeMirror-linenumbers']);
    // the same object is reused, otherwise the editor is re-configured on every change detection
    expect(source.editorOptions()).toBe(source.editorOptions());
  });

  it('highlights JSON or XML as asked', () => {
    fixture.componentRef.setInput('highlight', 'xml');
    expect(source.mode()).toBe('application/xml');

    fixture.componentRef.setInput('highlight', 'auto');
    source.text.set('{"dil": {}}');
    expect(source.mode()).toBe('application/json');
    source.text.set('  <dil/>');
    expect(source.mode()).toBe('application/xml');
    source.text.set('println 1');
    expect(source.mode()).toBe('text/plain');

    fixture.componentRef.setInput('highlight', 'none');
    source.text.set('<dil/>');
    expect(source.mode()).toBe('text/plain');
  });

  it('takes a file that is dropped on the editor', async () => {
    const file = new File(['{"dil":{}}'], 'flow.json');
    const drop = new Event('drop', { bubbles: true, cancelable: true });
    Object.defineProperty(drop, 'dataTransfer', { value: { files: [file] } });

    fixture.nativeElement.querySelector('.import-codemirror').dispatchEvent(drop);
    await waitFor(() => source.fileName() !== undefined);

    expect(drop.defaultPrevented).toBe(true);
    expect(source.text()).toBe('{"dil":{}}');
    expect(source.fileName()).toBe('flow.json');
  });
});

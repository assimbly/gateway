import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FaIconLibrary } from '@fortawesome/angular-fontawesome';

import { fontAwesomeIcons } from 'app/config/font-awesome-icons';

import { ImportSourceComponent } from './import-source.component';

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
    source.onDragOver({ preventDefault: jest.fn() } as unknown as DragEvent);
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

  it('shows pasted text in the text area', async () => {
    source.text.set('pasted');
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('textarea').value).toBe('pasted');
  });
});

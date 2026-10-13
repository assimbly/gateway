import { Component, input, model, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { readText } from './import-files';

let nextId = 0;

/** What an import reads: a file, chosen or dropped, or text pasted. The text is what the import page sends. */
@Component({
  selector: 'jhi-import-source',
  templateUrl: './import-source.component.html',
  imports: [FormsModule, FontAwesomeModule],
})
export class ImportSourceComponent {
  /** The `accept` of the file input, such as `.xml`. */
  readonly accept = input('');
  /** What the file is, as the user knows it: "a Flow export", "a script". */
  readonly kind = input('a file');
  readonly placeholder = input('');
  readonly rows = input(12);
  readonly maxBytes = input(5 * 1024 * 1024);

  readonly text = model('');
  /** The name of the file the text came from; undefined once the text is typed or pasted. */
  readonly fileName = model<string | undefined>(undefined);
  readonly fileChosen = output<File>();

  readonly problem = signal<string | undefined>(undefined);
  readonly dragging = signal(false);

  readonly inputId = `import-source-file-${nextId}`;
  readonly textId = `import-source-text-${nextId++}`;

  onFileInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (file) {
      void this.load(file);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.dragging.set(true);
  }

  onDragLeave(): void {
    this.dragging.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragging.set(false);
    const file = event.dataTransfer?.files?.[0];
    if (file) {
      void this.load(file);
    }
  }

  onTyped(text: string): void {
    this.text.set(text);
    this.fileName.set(undefined);
    this.problem.set(undefined);
  }

  async load(file: File): Promise<void> {
    this.problem.set(undefined);
    if (file.size > this.maxBytes()) {
      this.problem.set(`${file.name} is larger than ${Math.round(this.maxBytes() / (1024 * 1024))} MB.`);
      return;
    }
    try {
      this.text.set(await readText(file));
    } catch {
      this.problem.set(`Couldn't read ${file.name}.`);
      return;
    }
    this.fileName.set(file.name);
    this.fileChosen.emit(file);
  }
}

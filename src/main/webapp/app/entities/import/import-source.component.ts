import { Component, inject, input, model, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CodemirrorModule } from '@ctrl/ngx-codemirror';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/xml/xml';
import 'codemirror/addon/display/placeholder';

import { ThemeService } from 'app/core/theme';

import { isJson, readText } from './import-files';

let nextId = 0;

/** How the text is highlighted: as XML, as JSON or XML by what it looks like, or not at all. */
export type ImportHighlight = 'auto' | 'xml' | 'none';

/**
 * What an import reads: a file, chosen or dropped (on the button or on the editor), or text typed or pasted in a code
 * editor with line numbers. The text is what the import page sends.
 */
@Component({
  selector: 'jhi-import-source',
  templateUrl: './import-source.component.html',
  imports: [FormsModule, FontAwesomeModule, CodemirrorModule],
})
export class ImportSourceComponent {
  private readonly themeService = inject(ThemeService);

  /** The `accept` of the file input, such as `.xml`. */
  readonly accept = input('');
  /** What the file is, as the user knows it: "a Flow export", "a script". */
  readonly kind = input('a file');
  readonly placeholder = input('');
  /** The height of the editor, in lines. */
  readonly rows = input(12);
  readonly maxBytes = input(5 * 1024 * 1024);
  readonly highlight = input<ImportHighlight>('none');

  readonly text = model('');
  /** The name of the file the text came from; undefined once the text is typed or pasted. */
  readonly fileName = model<string | undefined>(undefined);
  readonly fileChosen = output<File>();

  readonly problem = signal<string | undefined>(undefined);
  readonly dragging = signal(false);

  readonly inputId = `import-source-file-${nextId++}`;

  private optionsCache: Record<string, unknown> | undefined;
  private optionsKey: string | undefined;

  /** The CodeMirror mode of the text. */
  mode(): string {
    switch (this.highlight()) {
      case 'xml':
        return 'application/xml';
      case 'auto': {
        const text = this.text();
        if (isJson(text)) {
          return 'application/json';
        }
        return text.trimStart().startsWith('<') ? 'application/xml' : 'text/plain';
      }
      default:
        return 'text/plain';
    }
  }

  /** CodeMirror options. The same object is returned until the theme, the mode or the placeholder changes. */
  editorOptions(): Record<string, unknown> {
    const theme = this.themeService.editorTheme();
    const mode = this.mode();
    const key = `${theme}|${mode}|${this.placeholder()}`;
    if (!this.optionsCache || this.optionsKey !== key) {
      this.optionsKey = key;
      this.optionsCache = {
        lineNumbers: true,
        gutters: ['CodeMirror-linenumbers'],
        lineWrapping: true,
        // a dropped file replaces the text (see `onDrop`), the editor must not insert it at the cursor as well
        dragDrop: false,
        placeholder: this.placeholder(),
        theme,
        mode,
      };
    }
    return this.optionsCache;
  }

  /** CodeMirror does not draw itself correctly (no line numbers) until it is refreshed once it is visible. */
  refreshCodeMirror(editor: { codeMirror?: { refresh: () => void } }): void {
    const codeMirror = editor?.codeMirror;
    if (!codeMirror) {
      return;
    }
    const refresh = () => codeMirror.refresh();
    requestAnimationFrame(() => {
      refresh();
      setTimeout(refresh);
    });
  }

  onFileInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (file) {
      void this.load(file);
    }
  }

  onDragOver(event: DragEvent): void {
    event.stopPropagation();
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

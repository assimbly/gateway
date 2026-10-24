import { Component, computed, inject, input, model, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { CodemirrorModule } from '@ctrl/ngx-codemirror';

import { ThemeService } from 'app/core/theme';

import SendHeadersEditor from './send-headers-editor';
import { SendHeader, filledHeaders } from './send-headers';
import { BodyMode, detectBodyMode, readFileAsText } from './send-upload';

/**
 * The message of the Send pages in two tabs: Body and Headers. The same on Flows > Send and Broker > Send.
 * A file dropped on the body replaces the body.
 */
@Component({
  selector: 'jhi-send-message-editor',
  imports: [FormsModule, NgbNavModule, CodemirrorModule, SendHeadersEditor],
  templateUrl: './send-message-editor.html',
})
export default class SendMessageEditor {
  private readonly themeService = inject(ThemeService);

  readonly body = model('');
  readonly headers = model<SendHeader[]>([]);
  readonly bodyMode = model<BodyMode>('text');
  readonly suggestions = input<string[]>([]);
  readonly templatesEnabled = input(false);
  /** A body of a few lines that grows as you type, for a side panel; the Send pages give the body a fixed, tall editor. */
  readonly compact = input(false);

  readonly activeTab = signal<'body' | 'headers'>('body');
  readonly headerCount = computed(() => filledHeaders(this.headers()).length);

  private optionsCache: Record<string, unknown> | undefined;
  private optionsKey: string | undefined;

  /** CodeMirror options of the body. The same object is returned until the theme or mode changes. */
  bodyEditorOptions(): Record<string, unknown> {
    const theme = this.themeService.editorTheme();
    const key = `${theme}|${this.bodyMode()}|${this.compact()}`;
    if (!this.optionsCache || this.optionsKey !== key) {
      this.optionsKey = key;
      this.optionsCache = {
        lineNumbers: true,
        gutters: ['CodeMirror-linenumbers'],
        lineWrapping: true,
        // a dropped file replaces the body (see `drop`), the editor must not insert it at the cursor as well
        dragDrop: false,
        theme,
        mode: this.bodyMode(),
        // a compact body grows with its text (up to a maximum height, see .body-codemirror--compact), so every line is drawn
        ...(this.compact() ? { viewportMargin: Infinity } : {}),
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

  allowDrop(event: DragEvent): void {
    event.stopPropagation();
    event.preventDefault();
  }

  async drop(event: DragEvent): Promise<void> {
    event.preventDefault();
    const file = event.dataTransfer?.files?.[0];
    if (file) {
      const text = await readFileAsText(file);
      this.body.set(text);
      this.bodyMode.set(detectBodyMode(text));
    }
  }
}

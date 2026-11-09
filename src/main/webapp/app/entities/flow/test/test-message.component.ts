import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { CodemirrorModule } from '@ctrl/ngx-codemirror';

import { ThemeService } from 'app/core/theme';
import { detectResponseMode } from 'app/shared/send/send-upload';

import { TestMessage } from './flow-test-run';

/**
 * A message of a test run, read-only, in the same Body and Headers tabs as the message the Tester sends
 * (`jhi-send-message-editor`), so In and Out look alike.
 */
@Component({
  selector: 'jhi-test-message',
  templateUrl: './test-message.component.html',
  styleUrl: './test-message.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, NgbNavModule, CodemirrorModule],
})
export class TestMessageComponent {
  readonly message = input<TestMessage | null | undefined>();
  /** Shown instead of the tabs when there is no message. */
  readonly placeholder = input('');

  readonly activeTab = signal<'body' | 'headers'>('body');
  readonly headers = computed(() => Object.entries(this.message()?.headers ?? {}));

  private readonly themeService = inject(ThemeService);

  /** CodeMirror options of the body; a new object only when the theme or the kind of body changes, so the editor isn't rebuilt. */
  readonly bodyOptions = computed(() => ({
    lineNumbers: true,
    gutters: ['CodeMirror-linenumbers'],
    lineWrapping: true,
    readOnly: true,
    theme: this.themeService.editorTheme(),
    mode: this.bodyMode(),
    // the body grows with its text, up to a maximum height (see .body-codemirror--compact), so every line is drawn
    viewportMargin: Infinity,
  }));

  private readonly bodyMode = computed(() => detectResponseMode(this.message()?.body));

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
}

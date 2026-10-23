import { Component, OnDestroy, OnInit, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { DomSanitizer } from '@angular/platform-browser';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { map } from 'rxjs';

import { VariableKeysService } from 'app/entities/environment-variables/variable-keys.service';

import { clearHighlight, highlight } from './tutorial-highlight';
import { TutorialPanelState } from './tutorial-panel.state';
import { TutorialService } from './tutorial.service';
import { groupByTrack } from './tutorial-tracks';

/**
 * The Tutorials panel, docked next to the page: the list of tutorials, then the open tutorial one step at a time, with
 * Show me buttons that point at what a step is about, and a tick once the Gateway shows the user did it.
 */
@Component({
  selector: 'jhi-tutorial-panel',
  standalone: true,
  templateUrl: './tutorial-panel.component.html',
  styleUrl: './tutorial-panel.component.scss',
  imports: [FontAwesomeModule],
  host: {
    role: 'complementary',
    'aria-labelledby': 'tutorial-panel-title',
  },
})
export class TutorialPanelComponent implements OnInit, OnDestroy {
  readonly tutorials = inject(TutorialService);
  readonly panel = inject(TutorialPanelState);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly variables = inject(VariableKeysService);

  // the tutorials are first-party Markdown bundled with the Gateway; their Show me buttons need their data attribute
  /** The tutorials by track, such as Get started and Messaging. */
  readonly tracks = computed(() => groupByTrack(this.tutorials.summaries()));
  readonly html = computed(() => this.sanitizer.bypassSecurityTrustHtml(this.tutorials.step()?.html ?? ''));
  /** Whether the last Show me found nothing on this page. */
  readonly notFound = signal(false);
  /** Where the Variable `messages` points: the folder the tutorials keep their files in, or undefined when unknown. */
  readonly messagesFolder = toSignal(this.variables.values().pipe(map(values => values?.['messages'] || undefined)));
  /** Whether the open step is about files in the messages folder, so the panel says where that folder is. */
  readonly mentionsMessagesFolder = computed(() => /@\{messages\}|messages folder/.test(this.tutorials.step()?.html ?? ''));

  constructor() {
    effect(() => {
      this.tutorials.stepIndex();
      this.notFound.set(false);
      clearHighlight();
    });
  }

  ngOnInit(): void {
    this.tutorials.load();
  }

  ngOnDestroy(): void {
    this.tutorials.stopWatching();
    clearHighlight();
  }

  /**
   * A Show me button in the step points at its element, with the line it stands in; a value or code block is copied;
   * a link to another tutorial opens it in the panel.
   */
  onBodyClick(event: MouseEvent): void {
    const link = (event.target as Element | null)?.closest<HTMLAnchorElement>('a[href]');
    if (link && this.tutorials.follow(link.href)) {
      event.preventDefault();
      return;
    }
    const copyable = (event.target as Element | null)?.closest<HTMLElement>('[data-tour-copy]');
    if (copyable) {
      copy(copyable);
      return;
    }
    const button = (event.target as Element | null)?.closest<HTMLElement>('[data-tour-show]');
    const selector = button?.dataset['tourShow'];
    if (!button || !selector) {
      return;
    }
    this.notFound.set(false);
    void highlight(selector, describe(button)).then(found => this.notFound.set(!found));
  }
}

/**
 * Copies a value, or the code block next to a Copy button, to the clipboard. The value is selected as well, so it can
 * still be copied with Ctrl+C where the browser doesn't give the page the clipboard.
 */
function copy(copyable: HTMLElement): void {
  const button = copyable.matches('button');
  const source = button ? copyable.parentElement?.querySelector('pre') : copyable;
  if (!source) {
    return;
  }
  const range = document.createRange();
  range.selectNodeContents(source);
  endBeforeTrailingWhitespace(range, source);
  window.getSelection()?.removeAllRanges();
  window.getSelection()?.addRange(range);
  const copied = (): void => {
    copyable.classList.add('is-copied');
    if (button) {
      copyable.textContent = 'Copied';
    }
    setTimeout(() => {
      copyable.classList.remove('is-copied');
      if (button) {
        copyable.textContent = 'Copy';
      }
    }, 1500);
  };
  // copying the selection works where the page has no clipboard permission, such as an embedded browser
  if (document.execCommand('copy')) {
    copied();
  } else {
    void navigator.clipboard?.writeText(range.toString()).then(copied, () => undefined);
  }
}

/** Ends the range at the last character that isn't whitespace, such as the line break a code block ends with. */
function endBeforeTrailingWhitespace(range: Range, source: HTMLElement): void {
  const walker = document.createTreeWalker(source, NodeFilter.SHOW_TEXT);
  const texts: Text[] = [];
  while (walker.nextNode()) {
    texts.push(walker.currentNode as Text);
  }
  const last = texts.reverse().find(text => text.data.trim() !== '');
  if (last) {
    range.setEnd(last, last.data.trimEnd().length);
  }
}

/** The text of the list item or paragraph a Show me button is in, without the buttons. */
function describe(button: HTMLElement): string {
  const block = button.closest('li, p');
  if (!block) {
    return '';
  }
  const copy = block.cloneNode(true) as HTMLElement;
  copy.querySelectorAll('.tutorial-show, ul, ol').forEach(element => element.remove());
  return copy.textContent?.replace(/\s+/g, ' ').trim() ?? '';
}

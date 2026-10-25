import { Component, ElementRef, Injector, OnDestroy, OnInit, afterNextRender, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { DomSanitizer } from '@angular/platform-browser';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { map } from 'rxjs';

import { VariableKeysService } from 'app/entities/environment-variables/variable-keys.service';

import { clearHighlight, highlight, isHighlighting } from './tutorial-highlight';
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
    '(keydown)': 'onKeydown($event)',
  },
})
export class TutorialPanelComponent implements OnInit, OnDestroy {
  readonly tutorials = inject(TutorialService);
  readonly panel = inject(TutorialPanelState);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly variables = inject(VariableKeysService);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);

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
   * While focus is in the panel, but not in a field: Left and Right go to the previous and next step, as Back and Next
   * do, and Escape stops a Show me pointing, or else closes the panel.
   */
  onKeydown(event: KeyboardEvent): void {
    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || isEditable(event.target)) {
      return;
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      if (isHighlighting()) {
        clearHighlight();
      } else {
        this.panel.close();
        // back to the button that opened the panel, so the keyboard isn't left at the top of the page
        document.querySelector<HTMLElement>('[data-cy="tutorials"]')?.focus();
      }
      return;
    }
    if (!this.tutorials.step() || (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight')) {
      return;
    }
    event.preventDefault();
    if (event.key === 'ArrowLeft') {
      if (this.tutorials.stepIndex() === 0) {
        return;
      }
      this.tutorials.previous();
    } else {
      this.tutorials.next();
    }
    // a value in the old step, or Back on the first, can't keep focus; the step's title takes it so the keys keep working
    afterNextRender(
      () => {
        const host = this.host.nativeElement;
        if (!host.contains(document.activeElement) || (document.activeElement as HTMLButtonElement | null)?.disabled) {
          (host.querySelector<HTMLElement>('.tutorial-panel__step-title') ?? host).focus();
        }
      },
      { injector: this.injector },
    );
  }

  /** Enter or Space on a value in the step copies it, as a click does; buttons already click on these keys. */
  onBodyKeydown(event: KeyboardEvent): void {
    const copyable = event.target as Element | null;
    if ((event.key === 'Enter' || event.key === ' ') && copyable?.matches('[data-tour-copy]:not(button)')) {
      event.preventDefault();
      copy(copyable as HTMLElement);
    }
  }

  /** The messages folder is copied with its button. */
  copyFolder(value: HTMLElement): void {
    copy(value);
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

/** Whether keys typed into the element are its own, such as in a field or a code editor. */
function isEditable(target: EventTarget | null): boolean {
  const element = target as HTMLElement | null;
  return !!element?.closest?.('input, textarea, select, [contenteditable]:not([contenteditable="false"]), .cm-editor');
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

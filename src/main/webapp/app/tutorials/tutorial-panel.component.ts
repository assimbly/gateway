import { Component, ElementRef, Injector, OnDestroy, OnInit, afterNextRender, computed, effect, inject, signal, viewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { firstValueFrom, map } from 'rxjs';

import { VariableKeysService } from 'app/entities/environment-variables/variable-keys.service';

import { clearHighlight, highlight, isHighlighting, isVisible } from './tutorial-highlight';
import { TutorialPages } from './tutorial-pages';
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
  private readonly pages = inject(TutorialPages);
  private readonly router = inject(Router);
  private readonly lightbox = viewChild.required<ElementRef<HTMLDialogElement>>('lightbox');

  /** The tutorials by track, such as Get started and Messaging. */
  readonly tracks = computed(() => groupByTrack(this.tutorials.summaries()));
  // trusted: first-party Markdown bundled from content/tutorials/; its Show me buttons need their data attribute
  readonly html = computed(() => this.sanitizer.bypassSecurityTrustHtml(this.tutorials.step()?.html ?? ''));
  /**
   * Why the last Show me found nothing: the element is on a page the panel couldn't open, or it's in the Test view of
   * the editor the user is in.
   */
  readonly hint = signal<'elsewhere' | 'test' | undefined>(undefined);
  /** The screenshot the user clicked, shown at full size. */
  readonly enlarged = signal<{ src: string; alt: string } | undefined>(undefined);
  /** Where the Variable `messages` points: the folder the tutorials keep their files in, or undefined when unknown. */
  readonly messagesFolder = toSignal(this.variables.values().pipe(map(values => values?.['messages'] || undefined)));
  /** Whether the open step is about files in the messages folder, so the panel says where that folder is. */
  readonly mentionsMessagesFolder = computed(() => /@\{messages\}|messages folder/.test(this.tutorials.step()?.html ?? ''));

  constructor() {
    effect(() => {
      this.tutorials.stepIndex();
      this.hint.set(undefined);
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
    // the enlarged screenshot closes on Escape by itself, and keeps the panel open
    if ((event.target as Element | null)?.closest?.('dialog')) {
      return;
    }
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

  /**
   * Enter or Space on a value in the step copies it, and on a screenshot enlarges it, as a click does; buttons already
   * click on these keys.
   */
  onBodyKeydown(event: KeyboardEvent): void {
    const target = event.target as Element | null;
    if (event.key !== 'Enter' && event.key !== ' ') {
      return;
    }
    if (target?.matches('[data-tour-copy]:not(button)')) {
      event.preventDefault();
      copy(target as HTMLElement);
    } else if (target instanceof HTMLImageElement) {
      event.preventDefault();
      this.enlarge(target);
    }
  }

  /** The messages folder is copied with its button. */
  copyFolder(value: HTMLElement): void {
    copy(value);
  }

  /**
   * A Show me button in the step points at its element, with the line it stands in; a value or code block is copied;
   * a screenshot is enlarged; a link to another tutorial opens it in the panel.
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
    if (event.target instanceof HTMLImageElement) {
      this.enlarge(event.target);
      return;
    }
    const button = (event.target as Element | null)?.closest<HTMLElement>('[data-tour-show]');
    const selector = button?.dataset['tourShow'];
    if (button && selector) {
      void this.show(selector, button.dataset['tourPage'], describe(button));
    }
  }

  /**
   * Points at the element. When it isn't on this page but the tutorial says which page it's on, that page opens first;
   * the editor still asks before it drops unsaved changes. A route is always checked: a button such as Stop or Add is
   * on several pages, so seeing one doesn't mean this is the page the step is about.
   */
  async show(selector: string, page: string | undefined, text: string): Promise<void> {
    this.hint.set(undefined);
    const url = page && (page.startsWith('/') || !isVisible(selector)) ? await firstValueFrom(this.pages.url(page)) : undefined;
    const elsewhere = url !== undefined && !this.pages.isCurrent(url);
    if (elsewhere && !(await this.router.navigateByUrl(url))) {
      // the user chose to stay, for example to keep unsaved changes
      return;
    }
    if (await highlight(selector, text)) {
      return;
    }
    // in the editor of the right Flow, but in Design: the user switches to Test themselves, as reopening would reload it
    const inDesign = url !== undefined && !elsewhere && url.queryParams['view'] === 'test';
    this.hint.set(inDesign ? 'test' : 'elsewhere');
  }

  closeEnlarged(): void {
    this.lightbox().nativeElement.close();
  }

  private enlarge(image: HTMLImageElement): void {
    clearHighlight();
    this.enlarged.set({ src: image.src, alt: image.alt });
    this.lightbox().nativeElement.showModal();
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
    void navigator.clipboard?.writeText(range.toString()).then(copied, (): void => undefined);
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

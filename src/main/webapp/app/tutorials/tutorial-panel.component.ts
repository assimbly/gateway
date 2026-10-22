import { Component, OnDestroy, OnInit, computed, effect, inject, signal } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { clearHighlight, highlight } from './tutorial-highlight';
import { TutorialPanelState } from './tutorial-panel.state';
import { TutorialService } from './tutorial.service';

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

  // the tutorials are first-party Markdown bundled with the Gateway; their Show me buttons need their data attribute
  readonly html = computed(() => this.sanitizer.bypassSecurityTrustHtml(this.tutorials.step()?.html ?? ''));
  /** Whether the last Show me found nothing on this page. */
  readonly notFound = signal(false);

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
    void navigator.clipboard?.writeText(source.textContent?.replace(/\n$/, '') ?? '').then(copied, () => undefined);
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

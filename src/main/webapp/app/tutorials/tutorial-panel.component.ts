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

  /** A Show me button in the step points at its element, with the line it stands in. */
  onBodyClick(event: MouseEvent): void {
    const button = (event.target as Element | null)?.closest<HTMLElement>('[data-tour-show]');
    const selector = button?.dataset['tourShow'];
    if (!button || !selector) {
      return;
    }
    this.notFound.set(false);
    void highlight(selector, describe(button)).then(found => this.notFound.set(!found));
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

import { Service, signal } from '@angular/core';

/**
 * Whether the Tutorials panel is open. The shell and the navbar only need this, so the panel itself, with its Markdown
 * renderer and highlighter, loads when it's first opened. It stays open across reloads, so a user can carry on.
 */
@Service()
export class TutorialPanelState {
  static readonly STORAGE_KEY = 'jhi-tutorial-panel-open';

  private readonly openState = signal(this.read());

  readonly open = this.openState.asReadonly();

  toggle(): void {
    this.set(!this.openState());
  }

  close(): void {
    this.set(false);
  }

  show(): void {
    this.set(true);
  }

  /** Opens the panel for a user who never opened or closed it, such as on an empty Gateway on first login. */
  showOnFirstVisit(): void {
    let stored: string | null = 'false';
    try {
      stored = localStorage.getItem(TutorialPanelState.STORAGE_KEY);
    } catch {
      // storage can be blocked; then the panel isn't opened unasked on every visit
    }
    if (stored === null) {
      this.show();
    }
  }

  private set(open: boolean): void {
    this.openState.set(open);
    try {
      localStorage.setItem(TutorialPanelState.STORAGE_KEY, String(open));
    } catch {
      // storage can be blocked; the panel then just doesn't reopen after a reload
    }
  }

  private read(): boolean {
    try {
      return localStorage.getItem(TutorialPanelState.STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  }
}

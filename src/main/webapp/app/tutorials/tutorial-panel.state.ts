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

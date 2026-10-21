import type { Driver } from 'driver.js';

/** How long to wait for an element that is still being rendered, for example after the page changed. */
const WAIT_MS = 5000;
const POLL_MS = 150;

let active: Driver | undefined;

/**
 * Points at the first visible element that matches the selector, with the text of the step next to it. Resolves to
 * false when there is no such element on this page, so the panel can say where to go first.
 */
export async function highlight(selector: string, text: string): Promise<boolean> {
  const element = await waitForVisible(selector);
  if (!element) {
    return false;
  }
  const { driver } = await import('driver.js');
  active?.destroy();
  active = driver({
    popoverClass: 'tutorial-popover',
    overlayOpacity: 0.35,
    stagePadding: 4,
    stageRadius: 4,
    showButtons: ['close'],
    onDestroyed: () => (active = undefined),
  });
  active.highlight({ element, popover: text ? { description: text, side: 'bottom', align: 'start' } : undefined });
  // doing what the step says ends the pointing
  element.addEventListener('click', () => active?.destroy(), { once: true });
  return true;
}

export function clearHighlight(): void {
  active?.destroy();
}

async function waitForVisible(selector: string): Promise<HTMLElement | undefined> {
  const deadline = Date.now() + WAIT_MS;
  for (;;) {
    const element = findVisible(selector);
    if (element || Date.now() >= deadline) {
      return element;
    }
    await new Promise(resolve => setTimeout(resolve, POLL_MS));
  }
}

function findVisible(selector: string): HTMLElement | undefined {
  try {
    return Array.from(document.querySelectorAll<HTMLElement>(selector)).find(element => element.getClientRects().length > 0);
  } catch {
    // a selector the browser doesn't understand finds nothing
    return undefined;
  }
}

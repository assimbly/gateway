import { AfterViewInit, Directive, ElementRef, HostListener } from '@angular/core';

/**
 * Keeps Tab and Shift+Tab on data-entry fields. Icon and inline buttons are skipped.
 * Cancel and Save in the form footer stay in the sequence after the fields.
 */
@Directive({
  selector: '[jhiFieldTab]',
})
export class FieldTabDirective implements AfterViewInit {
  constructor(private host: ElementRef<HTMLElement>) {}

  ngAfterViewInit(): void {
    this.skipInlineControls(this.host.nativeElement);
  }

  @HostListener('keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Tab' || event.altKey || event.ctrlKey || event.metaKey) {
      return;
    }
    const root = this.host.nativeElement;
    this.skipInlineControls(root);
    const active = document.activeElement as HTMLElement | null;
    if (!active || !root.contains(active)) {
      return;
    }

    const sequence = [...this.fields(root), ...this.footerActions(root)];
    if (!sequence.length) {
      return;
    }

    let index = sequence.findIndex(field => this.sameStop(field, active));
    if (index < 0) {
      const next = this.nextStopFrom(root, active, sequence, event.shiftKey);
      if (!next) {
        return;
      }
      event.preventDefault();
      next.focus();
      return;
    }

    event.preventDefault();
    const nextIndex = event.shiftKey ? (index - 1 + sequence.length) % sequence.length : (index + 1) % sequence.length;
    sequence[nextIndex].focus();
  }

  private skipInlineControls(root: HTMLElement): void {
    root.querySelectorAll<HTMLElement>('button, a, [role="button"]').forEach(control => {
      if (control.closest('.form-fx-actions, .modal-footer')) {
        return;
      }
      control.tabIndex = -1;
    });
  }

  private fields(root: HTMLElement): HTMLElement[] {
    const seen = new Set<HTMLElement>();
    const fields: HTMLElement[] = [];
    root.querySelectorAll<HTMLElement>('input, select, textarea').forEach(field => {
      if (!this.isField(field)) {
        return;
      }
      const stop = this.stopFor(field);
      if (seen.has(stop)) {
        return;
      }
      seen.add(stop);
      fields.push(stop);
    });
    return fields;
  }

  private footerActions(root: HTMLElement): HTMLElement[] {
    return Array.from(root.querySelectorAll<HTMLButtonElement>('.form-fx-actions button, .modal-footer button')).filter(
      button => !button.disabled && this.isShown(button),
    );
  }

  private isField(field: HTMLElement): boolean {
    if (field.matches('input[type="hidden"], input[type="button"], input[type="submit"], input[type="reset"]')) {
      return false;
    }
    if ((field as HTMLInputElement).disabled) {
      return false;
    }
    const insideChooser = !!field.closest('ng-select, .CodeMirror');
    if ((field as HTMLInputElement).readOnly && !insideChooser) {
      return false;
    }
    return this.isShown(field) || insideChooser;
  }

  private stopFor(field: HTMLElement): HTMLElement {
    const selectInput = field.closest('ng-select')?.querySelector<HTMLElement>('.ng-input input');
    if (selectInput) {
      return selectInput;
    }
    const editor = field.closest('.CodeMirror')?.querySelector<HTMLElement>('textarea');
    return editor ?? field;
  }

  private sameStop(stop: HTMLElement, active: HTMLElement): boolean {
    if (stop === active || stop.contains(active)) {
      return true;
    }
    const editor = active.closest('.CodeMirror');
    return !!editor && editor.contains(stop);
  }

  private nextStopFrom(root: HTMLElement, active: HTMLElement, sequence: HTMLElement[], backwards: boolean): HTMLElement | null {
    const ordered = Array.from(root.querySelectorAll<HTMLElement>('input, select, textarea, button, a'));
    const position = ordered.findIndex(element => element === active || element.contains(active));
    if (position < 0) {
      return null;
    }
    const candidates = backwards ? ordered.slice(0, position).reverse() : ordered.slice(position + 1);
    for (const candidate of candidates) {
      const stop = sequence.find(field => this.sameStop(field, candidate));
      if (stop) {
        return stop;
      }
    }
    return backwards ? sequence[sequence.length - 1] : sequence[0];
  }

  private isShown(element: HTMLElement): boolean {
    let node: HTMLElement | null = element;
    const root = this.host.nativeElement;
    while (node && node !== root.parentElement) {
      if (node.hasAttribute('hidden')) {
        return false;
      }
      const style = getComputedStyle(node);
      if (style.display === 'none' || style.visibility === 'hidden') {
        return false;
      }
      node = node.parentElement;
    }
    return true;
  }
}

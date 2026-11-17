import { Component, OnInit, computed, inject, input } from '@angular/core';

import { DocsUrlService } from './docs-url.service';

let nextId = 0;

/**
 * What a page shows when there is nothing to list yet: a short explanation, one primary button and a link to import
 * something or to read the docs. Every empty list uses it, so a new user meets the same screen everywhere.
 *
 * - `heading` and `description` are the explanation.
 * - `[primary]` is the one primary button (or link styled as one).
 * - `[secondary]` is the link to import something, written as a sentence ending in a link.
 * - Anything else, such as the choices of the Flows page, is shown between the explanation and the button.
 */
@Component({
  selector: 'jhi-empty-state',
  templateUrl: './empty-state.html',
  styleUrl: './empty-state.scss',
})
export default class EmptyState implements OnInit {
  readonly heading = input.required<string>();
  readonly description = input('');
  /** Adds a "Read the docs" link after the secondary link. */
  readonly docs = input(false);

  protected readonly titleId = `empty-state-title-${nextId++}`;
  private readonly docsUrlService = inject(DocsUrlService);
  protected readonly docsUrl = this.docsUrlService.url;
  protected readonly showDocs = computed(() => this.docs() && this.docsUrl() !== '');

  ngOnInit(): void {
    if (this.docs()) {
      this.docsUrlService.load();
    }
  }
}

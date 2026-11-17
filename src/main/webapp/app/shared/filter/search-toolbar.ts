import { Component, OnInit, input, model } from '@angular/core';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap/tooltip';

@Component({
  selector: 'jhi-search-toolbar',
  imports: [FontAwesomeModule, NgbTooltip],
  templateUrl: './search-toolbar.html',
  styleUrl: './search-toolbar.scss',
})
export default class SearchToolbar implements OnInit {
  readonly query = model('');
  readonly placeholder = input('');
  readonly persistKey = input<string | undefined>(undefined);
  readonly inputId = input('search-toolbar-input');
  readonly ariaLabel = input<string | undefined>(undefined);
  /** One sentence on what the listed things are, shown from an info button so it takes no room on the page. */
  readonly hint = input('');

  ngOnInit(): void {
    const key = this.persistKey();
    if (!key) {
      return;
    }
    const saved = localStorage.getItem(key);
    if (saved) {
      this.query.set(saved);
    }
  }

  onInput(event: Event): void {
    this.onQueryChange((event.target as HTMLInputElement).value);
  }

  onQueryChange(value: string): void {
    this.query.set(value);
    this.persist(value);
  }

  clear(): void {
    this.onQueryChange('');
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this.query()) {
      event.preventDefault();
      this.clear();
    }
  }

  private persist(value: string): void {
    const key = this.persistKey();
    if (!key) {
      return;
    }
    localStorage.setItem(key, value);
  }
}

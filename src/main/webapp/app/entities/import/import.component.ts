import { Component, ViewEncapsulation } from '@angular/core';

import { ImportChoicesComponent } from './import-choices.component';

/** The Import page: what can be imported, and where it ends up. */
@Component({
  selector: 'jhi-import',
  templateUrl: './import.component.html',
  styleUrl: './import.scss',
  encapsulation: ViewEncapsulation.None,
  imports: [ImportChoicesComponent],
})
export class ImportComponent {}

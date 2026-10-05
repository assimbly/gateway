import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { FlowEditorEsbComponent } from './flow-editor-esb.component';

@Component({
  selector: 'jhi-flow-editor',
  templateUrl: './flow-editor.component.html',
  imports: [FlowEditorEsbComponent],
})
export class FlowEditorComponent implements OnInit {

  editor: string = 'esb';

  @ViewChild(FlowEditorEsbComponent) esbEditor?: FlowEditorEsbComponent;

  /** Asks before leaving the editor with unsaved changes. */
  canDeactivate(): boolean {
    return !this.esbEditor?.hasUnsavedChanges || window.confirm('This Flow has unsaved changes. Leave without saving?');
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.editor = 'esb';
    });

  }

}

export class Option {
  constructor(public key?: string, public value?: string) {}
}

export class TypeLinks {
  constructor(public name: string, public assimblyTypeLink: string, public camelTypeLink: string) {}
}

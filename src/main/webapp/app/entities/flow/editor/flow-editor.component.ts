import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { FlowEditorEsbComponent } from './flow-editor-esb.component';
import { confirmChoice } from './confirm-dialog.component';

@Component({
  selector: 'jhi-flow-editor',
  templateUrl: './flow-editor.component.html',
  imports: [FlowEditorEsbComponent],
})
export class FlowEditorComponent implements OnInit {

  editor: string = 'esb';

  @ViewChild(FlowEditorEsbComponent) esbEditor?: FlowEditorEsbComponent;

  private readonly modalService = inject(NgbModal);

  /** Asks before leaving the editor with unsaved changes: save them first, leave them, or keep editing. */
  async canDeactivate(): Promise<boolean> {
    const editor = this.esbEditor;
    if (!editor?.hasUnsavedChanges) {
      return true;
    }
    const choice = await confirmChoice(this.modalService, 'Unsaved changes', 'This Flow has changes that are not saved yet.', [
      { value: 'stay', label: 'Keep editing', style: 'secondary' },
      { value: 'leave', label: 'Leave without saving', style: 'danger' },
      { value: 'save', label: 'Save and leave', style: 'primary', icon: 'save' },
    ]);
    if (choice === 'save') {
      return editor.saveBeforeLeaving();
    }
    return choice === 'leave';
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

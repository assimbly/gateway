import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'jhi-flow-editor',
  templateUrl: './flow-editor.component.html'
})
export class FlowEditorComponent implements OnInit {

  editor: string = 'unknown';

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

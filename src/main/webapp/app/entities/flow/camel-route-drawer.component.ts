import { Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { CodemirrorModule } from '@ctrl/ngx-codemirror';
import 'codemirror/mode/xml/xml';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgbActiveOffcanvas, NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';

import { ThemeService } from 'app/core/theme';

import { hasRoute, maskSecrets, routeFileName } from './camel-route';
import { LogFlow } from './flow-log-drawer.component';
import { FlowService } from './flow.service';

/**
 * The Camel route the runtime built for a Flow, in a side drawer: Camel's XML DSL with the Steps expanded and the
 * Variables put in, secrets hidden, to read, copy or download. A Flow that isn't loaded has no route yet. The visual
 * editor also shows it in a tab, given the Flow by its inputs.
 */
@Component({
  selector: 'jhi-camel-route-drawer',
  templateUrl: './camel-route-drawer.component.html',
  imports: [FormsModule, FontAwesomeModule, CodemirrorModule],
  // The drawer puts this element between .offcanvas and the body: it has to fill the drawer for the editor to get a height.
  host: { class: 'd-flex flex-column h-100 overflow-hidden' },
})
export class CamelRouteDrawerComponent {
  readonly flow = signal<LogFlow | undefined>(undefined);
  readonly route = signal<string | null>(null);
  readonly loading = signal(false);
  readonly failed = signal<string | null>(null);
  readonly copied = signal(false);

  /** Shown in a page rather than a drawer: the Flow to show the route of. */
  readonly flowId = input<number | null | undefined>();
  readonly flowName = input<string | null | undefined>();

  /** The drawer the route is shown in; null when it is shown in a page. */
  readonly activeOffcanvas = inject(NgbActiveOffcanvas, { optional: true });
  private readonly flowService = inject(FlowService);
  private readonly themeService = inject(ThemeService);

  /** A read-only XML editor with line numbers; long URIs wrap. */
  readonly editorOptions = computed(() => ({
    lineNumbers: true,
    lineWrapping: true,
    readOnly: true,
    mode: 'application/xml',
    theme: this.themeService.editorTheme(),
  }));

  constructor() {
    effect(() => {
      const id = this.flowId();
      if (id) {
        untracked(() => {
          this.flow.set({ id, name: this.flowName() });
          this.load();
        });
      }
    });
  }

  /** CodeMirror does not draw itself correctly (no line numbers) until it is refreshed once it is visible. */
  refreshCodeMirror(editor: { codeMirror?: { refresh: () => void } }): void {
    const codeMirror = editor?.codeMirror;
    if (!codeMirror) {
      return;
    }
    const refresh = () => codeMirror.refresh();
    requestAnimationFrame(() => {
      refresh();
      setTimeout(refresh);
    });
  }

  /** Opens a drawer with the Camel route of a Flow. */
  static open(offcanvas: NgbOffcanvas, flow: LogFlow): void {
    const ref = offcanvas.open(CamelRouteDrawerComponent, {
      position: 'end',
      ariaLabelledBy: 'camel-route-title',
      panelClass: 'flow-log-drawer',
    });
    const drawer: CamelRouteDrawerComponent = ref.componentInstance;
    drawer.flow.set(flow);
    drawer.load();
  }

  load(): void {
    const flow = this.flow();
    if (!flow) {
      return;
    }
    this.loading.set(true);
    this.failed.set(null);
    this.flowService.getCamelRoute(flow.id).subscribe({
      next: response => {
        const answer = response.body;
        this.route.set(hasRoute(answer) ? maskSecrets(answer) : null);
        this.loading.set(false);
      },
      error: () => {
        this.route.set(null);
        this.failed.set("Couldn't load the route from the runtime.");
        this.loading.set(false);
      },
    });
  }

  copy(): void {
    const route = this.route();
    if (route) {
      navigator.clipboard?.writeText(route).then(() => {
        this.copied.set(true);
        setTimeout(() => this.copied.set(false), 2000);
      });
    }
  }

  download(): void {
    const route = this.route();
    if (!route) {
      return;
    }
    const url = URL.createObjectURL(new Blob([route], { type: 'application/xml' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = routeFileName(this.flow()?.name);
    link.click();
    URL.revokeObjectURL(url);
  }
}

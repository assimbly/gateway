import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';

import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

/** What a card opens: the editor for a new Flow of a type (the type is also the `editor` query parameter), or the API designer. */
interface FlowTypeChoice {
  title: string;
  level: string;
  audience: string;
  icon: IconProp;
  link: string;
  queryParams?: { mode: string; editor: 'flow' | 'script' | 'route' };
}

const FLOW_TYPES: readonly FlowTypeChoice[] = [
  {
    title: 'Visual',
    level: 'No code · recommended',
    audience: 'Connect Steps on a canvas. For anyone who knows the systems they integrate.',
    icon: 'sitemap',
    link: '/flow/editor',
    queryParams: { mode: 'edit', editor: 'flow' },
  },
  {
    title: 'Camel route',
    level: 'Low code',
    audience: 'A hand-written Apache Camel route. For Camel engineers.',
    icon: 'code',
    link: '/flow/editor',
    queryParams: { mode: 'edit', editor: 'route' },
  },
  {
    title: 'Script',
    level: 'Code',
    audience: 'A Source, a script and an error handler. For when a few lines of code are quicker.',
    icon: 'file-alt',
    link: '/flow/editor',
    queryParams: { mode: 'edit', editor: 'script' },
  },
  {
    title: 'API',
    level: 'Design',
    audience: 'Design an OpenAPI contract-first REST API.',
    icon: 'plug',
    link: '/rest-apis/new',
  },
];

/** The Flow types as cards that open the editor for a new Flow, plus an optional Import from file card. */
@Component({
  selector: 'jhi-flow-type-choices',
  templateUrl: './flow-type-choices.component.html',
  styleUrl: './flow-type-choices.component.scss',
  imports: [RouterLink, FontAwesomeModule],
})
export class FlowTypeChoicesComponent {
  readonly withImport = input(false);
  readonly chosen = output<void>();
  readonly importChosen = output<void>();
  readonly flowTypes = FLOW_TYPES;
}

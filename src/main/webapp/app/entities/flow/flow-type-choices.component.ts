import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';

import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

/** A Flow type as stored in `flow.type`, which is also the `editor` query parameter of `/flow/editor`. */
type FlowType = 'flow' | 'script' | 'route';

interface FlowTypeChoice {
  type: FlowType;
  title: string;
  level: string;
  audience: string;
  icon: IconProp;
}

const FLOW_TYPES: readonly FlowTypeChoice[] = [
  {
    type: 'flow',
    title: 'Visual',
    level: 'No code · recommended',
    audience: 'Connect Steps on a canvas. For anyone who knows the systems they integrate.',
    icon: 'sitemap',
  },
  {
    type: 'script',
    title: 'Script',
    level: 'Low code',
    audience: 'A Source, a script and an error handler. For when a few lines of code are quicker.',
    icon: 'file-alt',
  },
  {
    type: 'route',
    title: 'Camel route',
    level: 'Code',
    audience: 'A hand-written Apache Camel route. For Camel engineers.',
    icon: 'code',
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

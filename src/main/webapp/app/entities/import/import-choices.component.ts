import { Component, ViewEncapsulation, output } from '@angular/core';
import { RouterLink } from '@angular/router';

import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

interface ImportChoice {
  title: string;
  /** What it imports, as the file is called. */
  accepts: string;
  description: string;
  /** Where it lands. */
  target: string;
  icon: IconProp;
  link: string;
}

const IMPORT_CHOICES: readonly ImportChoice[] = [
  {
    title: 'Flow (DIL)',
    accepts: 'XML or JSON · a Flow export',
    description: 'A Flow saved with Export, from this or another Gateway. It opens in the visual editor.',
    target: 'Visual editor',
    icon: 'sitemap',
    link: '/import/flow',
  },
  {
    title: 'Camel XML',
    accepts: 'XML · route, routes or camelContext',
    description: 'Apache Camel routes. Each route becomes a Route Step of one new Flow.',
    target: 'Route editor',
    icon: 'road',
    link: '/import/camel',
  },
  {
    title: 'Script',
    accepts: 'Groovy, JavaScript, Python, Jactl, Simple, JSLT, XSLT, DataSonnet',
    description: 'A script becomes a new Flow with a scheduler Source, the script, a Log Step for its result and an error handler.',
    target: 'Script editor',
    icon: 'code',
    link: '/import/script',
  },
  {
    title: 'OpenAPI',
    accepts: 'JSON or YAML · OpenAPI 3.0 or 3.1',
    description: 'An OpenAPI document becomes a new API with a Draft Handler Flow for each Operation.',
    target: 'APIs',
    icon: 'plug',
    link: '/rest-apis/import',
  },
];

/** What can be imported, and where it ends up, as cards that open the importer. Shown on the Import page and in the Import dialog. */
@Component({
  selector: 'jhi-import-choices',
  templateUrl: './import-choices.component.html',
  styleUrl: './import.scss',
  encapsulation: ViewEncapsulation.None,
  imports: [RouterLink, FontAwesomeModule],
})
export class ImportChoicesComponent {
  readonly chosen = output<void>();
  readonly choices = IMPORT_CHOICES;
}

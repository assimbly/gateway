import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

import { splitShow } from './tutorial-parser';

/**
 * The Show me buttons of the tutorials point at elements by selector. When a template loses the attribute or id a
 * tutorial relies on, its Show me finds nothing, so this fails first: fix the template or the tutorial (in the
 * documentation repository, then npm run tutorials:sync).
 */
describe('tutorial anchors', () => {
  const webapp = join(__dirname, '..', '..');
  const tutorials = join(webapp, 'content', 'tutorials');
  const templates = htmlFiles(join(webapp, 'app'))
    .map(file => readFileSync(file, 'utf8'))
    .join('\n');

  const shows = readdirSync(tutorials, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .flatMap(entry => [...readFileSync(join(tutorials, entry.name, 'README.md'), 'utf8').matchAll(/<!--\s*show:\s*([\s\S]*?)\s*-->/g)])
    .map(match => splitShow(match[1]));
  const selectors = shows.map(([selector]) => selector);
  const pages = [...new Set(shows.map(([, page]) => page).filter((page): page is string => page !== undefined))];

  it('finds the Show me selectors of the tutorials', () => {
    expect(selectors.length).toBeGreaterThan(10);
  });

  it.each([...new Set(selectors.flatMap(selector => [...selector.matchAll(/\[data-tour="([^"]+)"\]/g)].map(match => match[1])))])(
    'a template has data-tour="%s"',
    name => {
      // Also as one of the names a binding picks from, as in [attr.data-tour]="failed ? 'a' : 'b'".
      expect(templates).toMatch(new RegExp(`data-tour="${name}"|\\[attr\\.data-tour\\]="[^"]*'${name}'`));
    },
  );

  it.each([...new Set(selectors.flatMap(selector => [...selector.matchAll(/\[data-cy="([^"]+)"\]/g)].map(match => match[1])))])(
    'a template has data-cy="%s"',
    name => {
      // Also as a bound name that starts with a fixed prefix, as in [attr.data-cy]="'test-view-' + tab.id", or with a
      // prefix handed to a template, as in context: { cy: 'script-tab-' }.
      const prefixes = [...templates.matchAll(/\[attr\.data-cy\]="'([\w-]+)' \+|\bcy: '([\w-]+)'/g)].map(match => match[1] ?? match[2]);
      expect(templates.includes(`data-cy="${name}"`) || prefixes.some(prefix => name.startsWith(prefix))).toBe(true);
    },
  );

  it.each([...new Set(selectors.flatMap(selector => [...selector.matchAll(/#([\w-]+)/g)].map(match => match[1])))])(
    'a template has the id %s',
    id => {
      expect(templates).toMatch(new RegExp(`(id|inputId|labelForId)="${id}"`));
    },
  );

  it('finds the pages of the Show me buttons', () => {
    expect(pages.length).toBeGreaterThan(10);
  });

  it.each(pages)('the page %s is a route, a Flow or an API', page => {
    expect(page).toMatch(/^(\/[\w/-]*|flow:\w+(:test)?|api:\w+)$/);
  });

  it.each(pages.filter(page => page.startsWith('/')))('a link goes to the page %s', page => {
    expect(templates).toMatch(new RegExp(`(routerLink|href)="${page}"`));
  });

  it('a Flows list row carries the name of its Flow', () => {
    expect(templates).toContain('[attr.data-flow-name]="flow.name"');
  });

  it('a queue row carries the name of its queue', () => {
    expect(templates).toContain('[attr.data-endpoint-name]="address.name"');
  });
});

function htmlFiles(folder: string): string[] {
  return readdirSync(folder, { withFileTypes: true }).flatMap(entry => {
    const path = join(folder, entry.name);
    if (entry.isDirectory()) {
      return htmlFiles(path);
    }
    return entry.name.endsWith('.html') ? [path] : [];
  });
}

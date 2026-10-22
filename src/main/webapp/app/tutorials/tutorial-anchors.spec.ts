import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

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

  const selectors = readdirSync(tutorials, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .flatMap(entry => [...readFileSync(join(tutorials, entry.name, 'README.md'), 'utf8').matchAll(/<!--\s*show:\s*([\s\S]*?)\s*-->/g)])
    .map(match => match[1]);

  it('finds the Show me selectors of the tutorials', () => {
    expect(selectors.length).toBeGreaterThan(10);
  });

  it.each([...new Set(selectors.flatMap(selector => [...selector.matchAll(/\[data-tour="([^"]+)"\]/g)].map(match => match[1])))])(
    'a template has data-tour="%s"',
    name => {
      expect(templates).toContain(`data-tour="${name}"`);
    },
  );

  it.each([...new Set(selectors.flatMap(selector => [...selector.matchAll(/#([\w-]+)/g)].map(match => match[1])))])(
    'a template has the id %s',
    id => {
      expect(templates).toMatch(new RegExp(`(id|inputId|labelForId)="${id}"`));
    },
  );

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

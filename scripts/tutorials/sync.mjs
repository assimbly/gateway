// Copies the tutorials that the Gateway can show in its Tutorials panel from where they are written into
// src/main/webapp/content/tutorials, and lists them in index.json there. The copy is committed, so a build doesn't
// need the documentation repository.
//
//   npm run tutorials:sync [-- <path to the documentation repository>]   (default: ../documentation)

import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const docs = resolve(root, process.argv[2] ?? process.env.ASSIMBLY_DOCS ?? '../documentation');
const target = join(root, 'src/main/webapp/content/tutorials');

/** In panel order: the Markdown of each tutorial and the folder with its images and fixtures. */
const TUTORIALS = [
  { markdown: join(root, 'docs/quick-start.md'), assets: join(docs, 'tutorials/v6/quick-start') },
  { markdown: join(docs, 'tutorials/v6/tutorial1/README.md'), assets: join(docs, 'tutorials/v6/tutorial1') },
  { markdown: join(docs, 'tutorials/v6/tutorial2/README.md'), assets: join(docs, 'tutorials/v6/tutorial2') },
];

const ASSET = /\.(png|jpe?g|gif|svg|xml|json)$/i;
const HEADER = /<!--\s*tutorial:\s*(\{[\s\S]*?\})\s*-->/;

for (const { markdown } of TUTORIALS) {
  if (!existsSync(markdown)) {
    console.error(`Not found: ${markdown}\nPass the path to the documentation repository: npm run tutorials:sync -- <path>`);
    process.exit(1);
  }
}

rmSync(target, { recursive: true, force: true });

const index = TUTORIALS.map(({ markdown, assets }) => {
  const text = readFileSync(markdown, 'utf8');
  const header = HEADER.exec(text);
  if (!header) {
    throw new Error(`${markdown} has no <!-- tutorial: {...} --> comment`);
  }
  const { id, title, minutes, fixtures } = JSON.parse(header[1]);
  const folder = join(target, id);
  mkdirSync(folder, { recursive: true });
  writeFileSync(join(folder, 'README.md'), text);
  const copied = existsSync(assets) ? readdirSync(assets).filter(file => ASSET.test(file)) : [];
  copied.forEach(file => copyFileSync(join(assets, file), join(folder, file)));
  console.log(`${id}: README.md${copied.length ? ', ' + copied.join(', ') : ''}`);
  return { id, title, minutes, fixtures: fixtures ?? {} };
});

writeFileSync(join(target, 'index.json'), JSON.stringify(index, null, 2) + '\n');
console.log(`Wrote ${index.length} tutorials to ${target}`);

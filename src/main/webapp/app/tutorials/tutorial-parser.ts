import { marked } from 'marked';

import { Tutorial, TutorialStep } from './tutorial.model';

/** Where the tutorials are served, as scripts/tutorials/sync.mjs copies them. */
export const TUTORIALS_URL = 'content/tutorials/';

const TUTORIAL_HEADER = /<!--\s*tutorial:\s*(\{[\s\S]*?\})\s*-->/;
const STEP_META = /<!--\s*step:\s*(\{[\s\S]*?\})\s*-->/;
const SHOW = /<!--\s*show:\s*([\s\S]*?)\s*-->/g;
/** A block only the written tutorial needs, such as the hint to follow it in the Gateway: the comment and the lines up to the next blank one. */
const WEB_ONLY = /<!--\s*web-only\s*-->\n(?:[^\n]+\n?)*/g;
const SECTION = /^## /m;

interface StepMeta {
  check?: string;
  skip?: boolean;
}

/**
 * A tutorial from its Markdown, as the documentation repository has it: the introduction and every `##` section that
 * isn't marked `<!-- step: {"skip":true} -->` become the steps of the panel. The HTML comments that steer the panel are
 * invisible on GitHub, so the same file is the written tutorial.
 */
export function parseTutorial(markdown: string): Tutorial {
  const text = markdown.replace(/\r\n?/g, '\n');
  const header = TUTORIAL_HEADER.exec(text);
  if (!header) {
    throw new Error('The tutorial has no <!-- tutorial: {...} --> comment.');
  }
  const { id, title, minutes, fixtures } = JSON.parse(header[1]) as Tutorial;

  const [intro, ...sections] = text.replace(TUTORIAL_HEADER, '').replace(WEB_ONLY, '').split(SECTION);
  const steps: TutorialStep[] = [{ title, html: render(intro.replace(/^# .*$/m, ''), id) }];
  for (const section of sections) {
    const newline = section.indexOf('\n');
    // the panel numbers its steps itself, so "3. Meet ExampleFlow" and "Step 2: Create TestFlow" lose their numbers
    const heading = (newline < 0 ? section : section.slice(0, newline)).trim().replace(/^(?:\d+\.|Step \d+:)\s*/, '');
    const body = newline < 0 ? '' : section.slice(newline + 1);
    const meta = stepMeta(body);
    if (!meta.skip) {
      steps.push({ title: heading, html: render(body.replace(STEP_META, ''), id), ...(meta.check ? { check: meta.check } : {}) });
    }
  }
  return { id, title, minutes, fixtures: fixtures ?? {}, steps };
}

function stepMeta(body: string): StepMeta {
  const match = STEP_META.exec(body);
  return match ? (JSON.parse(match[1]) as StepMeta) : {};
}

function render(markdown: string, id: string): string {
  const withButtons = markdown.replace(
    SHOW,
    (_, selector: string) => `<button type="button" class="tutorial-show" data-tour-show="${escapeAttribute(selector)}">Show me</button>`,
  );
  const html = marked.parse(withButtons, { async: false, gfm: true });
  return (
    html
      // images sit next to the tutorial
      .replace(/(<img\s[^>]*?src=")(?![a-z]+:|\/|#)([^"]+)"/gi, `$1${TUTORIALS_URL}${id}/$2"`)
      // other pages open next to the Gateway, not in its place
      .replace(/<a href="(https?:[^"]+)"/g, '<a href="$1" target="_blank" rel="noopener"')
  );
}

function escapeAttribute(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

import { parseTutorial } from './tutorial-parser';

const MARKDOWN = `# Quick start

<!-- tutorial: {"id":"quick-start","title":"Quick start","minutes":10,"fixtures":{"ExampleFlow":"ExampleFlow.xml"}} -->

Welcome to the Gateway.

<!-- web-only -->
> You can also follow this guide inside the Gateway.

## Prerequisites

<!-- step: {"skip":true} -->

You need Java.

## 3. Meet ExampleFlow

<!-- step: {"check":"flowExists:ExampleFlow"} -->

1. Find it on **Flows → Manage**. <!-- show: tr[data-flow-name="ExampleFlow"] -->

![The list](01-list.png)

See the [user guide](https://github.com/assimbly/gateway/wiki/user-guide).

## Step 4: Open it

Click it.
`;

describe('parseTutorial', () => {
  const tutorial = parseTutorial(MARKDOWN.replace(/\n/g, '\r\n'));

  it('reads the tutorial from its header comment', () => {
    expect(tutorial).toMatchObject({ id: 'quick-start', title: 'Quick start', minutes: 10, fixtures: { ExampleFlow: 'ExampleFlow.xml' } });
  });

  it('makes the introduction and each section that is not skipped a step', () => {
    expect(tutorial.steps.map(step => step.title)).toEqual(['Quick start', 'Meet ExampleFlow', 'Open it']);
    expect(tutorial.steps[0].html).toContain('Welcome to the Gateway.');
    expect(tutorial.steps[0].html).not.toContain('<h1');
  });

  it('leaves out what only the written tutorial needs', () => {
    expect(tutorial.steps[0].html).not.toContain('follow this guide');
    expect(tutorial.steps.map(step => step.html).join()).not.toContain('<!--');
  });

  it('reads the check of a step', () => {
    expect(tutorial.steps[1].check).toBe('flowExists:ExampleFlow');
    expect(tutorial.steps[2].check).toBeUndefined();
  });

  it('turns a show comment into a Show me button with the selector', () => {
    const button = htmlOf(tutorial.steps[1].html).querySelector<HTMLButtonElement>('button.tutorial-show');
    expect(button?.textContent).toBe('Show me');
    expect(button?.dataset['tourShow']).toBe('tr[data-flow-name="ExampleFlow"]');
  });

  it('makes code copyable', () => {
    const html = htmlOf(parseTutorial(`${MARKDOWN}\nSet **Path** to \`www.dneonline.com\`.\n\n\`\`\`xml\n<a/>\n\`\`\`\n`).steps[2].html);
    expect(html.querySelector('p code')?.hasAttribute('data-tour-copy')).toBe(true);
    const block = html.querySelector('.tutorial-code');
    expect(block?.querySelector('button')?.hasAttribute('data-tour-copy')).toBe(true);
    expect(block?.querySelector('pre code')?.hasAttribute('data-tour-copy')).toBe(false);
  });

  it('serves images from next to the tutorial and opens other pages in a new tab', () => {
    const html = htmlOf(tutorial.steps[1].html);
    expect(html.querySelector('img')?.getAttribute('src')).toBe('content/tutorials/quick-start/01-list.png');
    expect(html.querySelector('a')?.getAttribute('target')).toBe('_blank');
  });

  it('folds Before you start into the overview, collapsed', () => {
    const markdown = MARKDOWN.replace('## Prerequisites', '## Before you start\n\n<!-- step: {"check":"flowExists:TestFlow"} -->\n\n* *TestFlow*\n\n## Prerequisites');
    const steps = parseTutorial(markdown).steps;
    expect(steps.map(step => step.title)).toEqual(['Quick start', 'Meet ExampleFlow', 'Open it']);
    const details = htmlOf(steps[0].html).querySelector('details.tutorial-prerequisites');
    expect(details?.hasAttribute('open')).toBe(false);
    expect(details?.querySelector('summary')?.textContent).toBe('Before you start');
    expect(details?.querySelector('li')?.textContent).toBe('TestFlow');
  });

  it("leaves the What you'll learn label to the panel", () => {
    const html = parseTutorial(MARKDOWN.replace('Welcome to the Gateway.', "**What you'll learn**\n\n* Build a Flow")).steps[0].html;
    expect(html).not.toContain('What you');
    expect(htmlOf(html).querySelector('li')?.textContent).toBe('Build a Flow');
  });

  it('needs the header comment', () => {
    expect(() => parseTutorial('# No header\n\n## Step')).toThrow();
  });
});

function htmlOf(html: string): HTMLElement {
  const element = document.createElement('div');
  element.innerHTML = html;
  return element;
}

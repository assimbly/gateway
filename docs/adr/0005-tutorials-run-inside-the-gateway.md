# Tutorials run inside the Gateway, from the written tutorials

The Quick start and the tutorials can be followed in a Tutorials panel docked next to the page, so users no longer switch between the docs and the Gateway at every step. The panel shows the written tutorial itself, one `##` section per step. Each step can have a **Show me** that points at the element it's about, and a check that ticks the step off once the Gateway shows it was done, such as a Flow that started or an error in its log. We considered popover tours (Shepherd, Intro.js, ngx-ui-tour), hosted tour services (Pendo, Appcues) and tour scripts written in code. Popover tours fit short onboarding, not 10-minute tasks with dialogs, page changes and steps outside the Gateway such as dropping a file in a folder. Hosted services add an outside script and send usage data from self-hosted Gateways. Scripts in code would make a second copy of every tutorial. We chose a panel that renders the Markdown, with Driver.js only for pointing at an element.

## Setup

- **One source.** A tutorial is plain Markdown: in the documentation repository (`tutorials/v6/<tutorial>/README.md`), or in this repository for the Quick start (`docs/quick-start.md`). HTML comments, which GitHub doesn't show, steer the panel:
  - `<!-- tutorial: {"id", "title", "minutes", "fixtures"} -->` under the title
  - `<!-- step: {"check": "…"} -->` or `<!-- step: {"skip": true} -->` under a `##` heading
  - `<!-- show: <css selector> -->` in a line, which becomes a Show me button
  - `<!-- web-only -->` before a block only the written tutorial needs.
- **A committed copy.** `npm run tutorials:sync` (`scripts/tutorials/sync.mjs`) copies each tutorial with its images and fixture Flows into `src/main/webapp/content/tutorials/` and lists them in `index.json`. The copy is committed, so a build doesn't need the documentation repository, and a Gateway shows the tutorials of its own version.
- **Kept apart from the app.** The feature lives in `app/tutorials/` and loads when the panel first opens, so marked and Driver.js stay out of the main bundle. The shell knows only whether the panel is open (`TutorialPanelState`).
- **Checks read the Gateway as it is.** A check is `kind:arguments` (`flowExists`, `flowStep`, `apiExists`, `flowStatus`, `flowCompleted`, `flowFailed`, `flowAlerts`, `flowLog`, `route`), asked every 3 seconds through the existing services, with errors kept out of the page's alerts. A step without a check is ticked off when the user moves on.
- **Stable anchors.** Show me selectors use ids and labels that are already there, or inert `data-tour` attributes added to the templates for this. `tutorial-anchors.spec.ts` fails when a tutorial points at an anchor no template has any more.
- **Fixtures.** A tutorial can name the Flows it starts from with a DIL file next to it. The panel offers to import one the Gateway doesn't have, for example *ExampleFlow*.

## Writing a tutorial

Keep it simple:

- **Clear.** Few words. One action per line, in the words of the screen, with a Show me where it helps. Explain only what the user needs for the next step.
- **One capability at a time.** A tutorial shows one use case or capability of Assimbly, such as calling a web service or putting messages on a queue. What it only needs to start from, such as *TestFlow*, is a fixture, not a part of the tutorial.
- **5 to 15 minutes.** The Quick start takes 5, and uses only what a new Gateway already has (*ExampleFlow*). A tutorial that takes longer shows more than one thing: split it.
- Start where the user is: the Gateway is running and they're signed in. Installing and signing in are in `docs/install.md`, not in a tutorial.
- Give each step a check where the Gateway can tell it was done.

## Consequences

- A template change can break a Show me. Keep `data-tour` attributes when changing a template, or change the tutorial in the documentation repository and run `npm run tutorials:sync`.
- Changing a tutorial means syncing it here. Until then the Gateway shows the previous version.
- A check can only see what the Gateway exposes. A step whose result it can't read, such as an error on start, stays one the user ticks off themselves.
- A Show me can't point into a dropdown menu: clicking the panel closes the menu.
- A `flowLog` check also passes on text from an earlier run of the same Flow.

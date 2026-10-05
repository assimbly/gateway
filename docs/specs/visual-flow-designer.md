# Spec: Visual Flow Designer

> Status: ready for implementation. Branch: `visual-designer`.
> Vocabulary follows the root `CONTEXT.md`. Architectural constraint: ADR 0001, "A Flow is a tree".

## Problem Statement

Integration developers build Flows on the **Flows → Design → Editor** page by filling in a vertical list of forms, one per Step. The editor treats every Flow as a straight line. On each save it throws away all Links and rebuilds them from the order of the list. As a result:

- Users can't build Flows that branch. Routers (content, if, split, enrich, recipient, wiretap…) are supported by the runtime and already used in real Flows, but the editor can't show or edit their Branches. Saving such a Flow in the editor would flatten it and destroy its Branches.
- Users can't see what a Flow does at a glance. They have to read a stack of forms and work out in their heads how messages move.
- Router Conditions (for example `${body} contains 'x'`) can't be entered anywhere in the Gateway. Exporting a Flow drops them, even when they were imported from DIL.
- Flows with broken or missing Links open as a chain the editor guessed, and nothing tells the user.

## Solution

Replace the form-based editor with a **visual designer**: a canvas, built on Foblex Flow, where each Step is a square node and each Link is an arrow. It looks modern (like n8n) and behaves like Apache NiFi: nodes can be dragged anywhere, their positions are saved, and Links can be drawn by dragging from one Step to another.

- **A new Flow** starts with only a Source, at the left of the canvas. A **+** after the last Step adds the next one: an Action, a Router or a Sink, with its component chosen in the same searchable menu. A **+** on any Link inserts an Action or a Router there, and the Steps after it move one column to the right. A **+** on a List Router adds a Branch. Every new Branch gets its own new Sink. **Space** opens the **+** that fits the selection: after a selected last Step, on a selected Link or the Link out of a selected Step, or after the last Step when nothing is selected.
- **Clicking a node** opens that Step's editor (scheme, path, options) in a panel on the right. Clicking another node switches the panel to that Step. **Clicking a Link** opens the Link editor: Branch name, Condition, and advanced settings (transport, pattern). **Clicking the empty canvas** shows the Flow settings, including the Error Step.
- **The canvas enforces the Step rules** after every edit:
  - A Source has one outbound Link.
  - An Action has one inbound and one outbound Link.
  - A Router has one inbound Link and its Branches.
  - A Sink has one inbound Link.
  - A Flow has exactly one Source, and no Step has more than one inbound Link.
- **Saving.** The whole Flow is saved at once, with one Save button at the top right. A Flow that is still incomplete (a Step without its configuration, or a Branch that doesn't end in a Sink yet) can be saved as a **Draft**: invalid nodes are marked, and the Flow can't be started until they're fixed.
- **Existing Flows** open on the canvas. Flows without saved positions are laid out automatically, and broken Links are repaired by the next save.

## User Stories

### Opening and creating Flows

1. As an integration developer, I want the Flows → Design → Editor page to open a visual canvas instead of the list of forms, so that I can see the structure of my Flow at a glance.
2. As an integration developer, I want a new Flow to start with only a Source, and to add each next Step (Action, Router or Sink) with a **+** that lets me search for its component, so that I build the Flow in the order messages travel.
3. As an integration developer, I want a Flow that has only an Error Step (and no Source) to open like a new Flow, with a placeholder Source, so that empty Flows saved in the past can be finished.
4. As an integration developer, I want my existing straight-line Flows to open on the canvas as a chain of nodes, so that the new designer doesn't lock me out of my existing work.
5. As an integration developer, I want existing Flows that contain Routers to open with all their Branches drawn, so that I can finally see and edit the Branches the old editor hid.
6. As an integration developer, I want Flows without saved positions to be laid out automatically as a readable tree, so that I don't have to place every node myself the first time I open an old or imported Flow.
7. As an integration developer, I want an "auto-arrange" action, so that I can tidy up a Flow whose layout has become messy.
8. As an integration developer, I want a Flow with broken or missing Links to open as the most likely chain, with a notice that its Links will be repaired when I save, so that I can recover Flows that are damaged.
9. As an integration developer, I want a Flow that uses Step types the designer doesn't support (FROM, TO, API, …) to open read-only with an explanation, so that I don't corrupt it by accident.

### Building the Flow

10. As an integration developer, I want each Step shown as a square node with its kind (Source, Action, Router, Sink) and component, so that I can tell what each Step does.
11. As an integration developer, I want each Link shown as an arrow from the sending Step to the receiving Step, so that I can follow the path of a message.
12. As an integration developer, I want a **+** on every Link that lets me insert an Action there, so that I can add processing between two Steps.
13. As an integration developer, I want the **+** on a Link to also let me insert a Router there, so that I can introduce branching anywhere in the Flow.
14. As an integration developer, I want everything downstream of the insertion point to become the new Router's Default branch, so that inserting a Router never disconnects my existing Steps.
15. As an integration developer, I want a newly inserted Recipient list Router (which has no Default branch) to turn the downstream part of the Flow into its first Branch, so that nothing is lost.
16. As an integration developer, I want a Fixed-slot Router (if, split, enrich, wiretap, loop…) to get all its Branches, each ending in a new Sink, as soon as I add it, so that its required Branches are never missing.
17. As an integration developer, I want a **+** on a List Router (recipient, content, …) that adds a Branch ending in a new Sink, so that I can route to as many destinations as I need.
18. ~~As an integration developer, I want to drag from one Step's outbound Link end to another Step's inbound Link end to connect them.~~ *Dropped: see Further Notes.*
19. As an integration developer, I want the canvas to never let me create a Flow that breaks the Step rules (a second inbound Link, a loop, an outbound Link from a Sink, an inbound Link into the Source), so that I can't create a Flow the runtime can't run.
20. As an integration developer, I want to drag nodes anywhere on the canvas and have their positions saved with the Flow, so that my layout is still there next time.
21. As an integration developer, I want to pan and zoom the canvas, so that I can work on large Flows.
22. As an integration developer, I want to swap a Step's component for another one of the same kind (for example one Action for another), so that I can change what a Step does without rebuilding its surroundings.
23. As an integration developer, I want changes of kind (Action ↔ Router, Fixed-slot ↔ List Router) to be done by deleting and inserting, so that it's always clear what happens to Branches.

### Deleting

24. As an integration developer, I want deleting an Action to connect its upstream Step directly to its downstream Step, so that the Flow stays connected.
25. As an integration developer, I want deleting a Router to replace it with its Default branch (or its first Branch for a Recipient list Router), and to delete its other Branches after I confirm, so that I never end up with Steps that aren't connected to anything.
26. As an integration developer, I want deleting the Sink of a List Router's Branch, or that Branch's Link, to remove the whole Branch, so that no Branch is left without an end.
27. As an integration developer, I want to be prevented from deleting the Source, or any other Sink or Link the tree needs, so that the Flow always has a valid shape.

### Editing Steps, Links and the Flow

28. As an integration developer, I want clicking a node to open that Step's editor (scheme, path, options and its Connection, Message or Route) in a panel on the right, so that I can configure it without leaving the canvas.
29. As an integration developer, I want to click from node to node and have the panel follow, keeping the changes I made to each Step, so that I can configure a whole Flow in one session.
30. As an integration developer, I want clicking a Link to open the Link editor in the right panel, so that I can configure how messages travel along it.
31. As an integration developer, I want to see and edit a Router Branch's Condition (language and expression) on its Link, so that I can say when a message takes that Branch.
32. As an integration developer, I want the Branch name shown on a Router's Links, read-only on Fixed-slot Routers, so that I know which Branch is which (if / default, split / default, …).
33. As an integration developer, I want an advanced section in the Link editor for transport (sync by default) and exchange pattern (InOnly / InOut), so that I can tune how a Branch is called.
34. As an integration developer, I want Router Links to show their Branch name or Condition as a label on the arrow, so that I can read the routing logic from the canvas.
35. As an integration developer, I want clicking the empty canvas to show the Flow settings (name, notes, log level, Integration) and the Error Step settings, so that Flow-level configuration has a clear place.
36. As an integration developer, I want call-out Branches (enrich, split, loop) to be marked as returning to their Router, so that I understand the result flows back before the Flow continues on the Default branch.

### Saving, Drafts and safety

37. As an integration developer, I want to save the whole Flow with one Save action, so that a Flow is never stored half-edited.
38. As an integration developer, I want to save a Flow even if some Steps or Links are incomplete, so that I can save my work in progress.
39. As an integration developer, I want a Flow that has any invalid Step or Link to be a Draft automatically, so that I don't have to manage a status by hand.
40. As an integration developer, I want invalid nodes and Links highlighted on the canvas, so that I can see what still needs work.
41. As an operator, I want starting a Draft, and auto-starting it, to be blocked, so that incomplete Flows never run.
42. As an integration developer, I want to export a Draft, so that I can share work in progress.
43. As an integration developer, I want undo and redo (Ctrl+Z / Ctrl+Y) for structural edits and moves during my session, so that I can try things out safely.
44. As an integration developer, I want a warning before I leave the designer with unsaved changes, so that I don't lose work by accident.

### Interoperability

45. As an integration developer, I want an exported Flow to include each Router Link's Branch name, Condition (language and expression) and exchange pattern, so that the runtime routes messages exactly the way I designed.
46. As an integration developer, I want an exported Flow to include each Step's canvas coordinates, so that my layout survives an export and re-import.
47. As an integration developer, I want importing a DIL Flow to keep its Branch names, Conditions, patterns and coordinates, so that Flows made elsewhere open correctly in the designer.
48. As an integration developer, I want a split Router's Condition to live only on its Link, and the old copy in the Router's options to be dropped on save, so that there's a single source of truth.

## Implementation Decisions

### Domain rules (enforced by the canvas and the Flow graph model)

- **A Flow is a tree (ADR 0001).** It has exactly one Source, and no Step has more than one inbound Link. Branches never merge or loop, and every Branch ends in a Sink.
- **Link counts per Step:**
  - Source: 0 inbound, 1 outbound.
  - Action: 1 inbound, 1 outbound.
  - Router: 1 inbound, plus its Branches.
  - Sink: 1 inbound, 0 outbound.
- **The Error Step is not a node.** It's edited in the Flow settings and has no Links.
- **The canvas only places Source, Action, Router and Sink.** A Flow with any other Step type opens read-only, and is never a Draft.
- **Older Router Flows.** Imports made before this change gave all Branches of a Router one Link name. When those Branches have different settings, it can't be known which settings belong to which Step, so the Flow opens read-only and asks for its DIL to be imported again.
- **A Flow's Links must form a valid tree on load:** one Source reaching every Step, and every Step with the Links its kind needs. Otherwise the Links are rebuilt as a chain, and every Fixed-slot Router gets its named Branch back with a new Sink.
- **Router kinds have a branch shape**, held in a small table in the frontend:
  - **Fixed-slot:** one named Branch plus the Default branch. Kinds: if, split, splitandaggregate (and the namespace variants), enrich, wiretap, loop, dowhile.
  - **List with a Default branch:** content, dynamic.
  - **List without a Default branch:** recipient, link.
  - If the runtime adds a Router kind the table doesn't know, the Router is treated as a List Router without a Default branch.
- **How a Branch is stored on a Router's outbound Link:**
  - The Branch name goes in the Link's `rule`.
  - The Default branch is the outbound Link with no `rule`.
  - A Condition is the Link's `language` and `expression`. It always lives on the Link, never in the Router's options.
- **Call-out Branches** (enrich, split, splitandaggregate, loop, dowhile) end in a Sink like any other Branch. The canvas only labels them as returning.
- **Draft is derived, not stored.** A Flow is a Draft when any Step is missing its required configuration, a Router Link is missing a required Condition, or a Source or Action has no next Step yet (an open end). While it's a Draft, start is disabled and the Flow is saved with auto-start off (the Gateway itself does not know about Drafts). The Auto-start setting is shown in the Flow settings so it can be switched on again once the Flow is complete. Export still works.
- **Branch names** are unique per Router, and a named Branch of a Router with a Default branch can't lose its name.

### Frontend

- **Add `@foblex/flow` to the frontend dependencies.** Version 19.3.0 needs Angular ≥ 17.3, and the project uses Angular 22. Its `@foblex/*` peer packages come with it.
- **New module: the Flow graph model.** It's a plain TypeScript module with no Angular or Foblex dependency, and it holds all the domain rules. Its interface:
  - **Build** a graph from a Flow's Steps and Links as the REST API returns them. This includes repairing broken Links with today's guessing (match Link names, then fall back to id order), detecting unsupported Step types (opens read-only), and turning an empty Flow into a placeholder Source → Sink.
  - **Operations:**
    - insert Action into a Link
    - insert Router into a Link
    - add Branch to a List Router
    - delete Step
    - delete Branch
    - change a Step's component (same kind only)
    - move Step
    - edit Step configuration
    - edit Link (name, Condition, transport, pattern)
    - edit Flow settings
    - auto-arrange
  - **Every operation** either returns the new graph or rejects with a reason. The graph is never left in an invalid shape.
  - **Undo and redo** cover all of these operations. Edits made in a Step's form (its component, path and options) are not part of undo/redo.
  - **Queries:** Draft status and the list of validation problems per Step and Link.
  - **Output:** serialize to the Steps and Links to save.
- **New canvas component.** It's built on Foblex Flow and replaces the current form-based editor inside the existing Flows → Design → Editor route. It only renders the graph model and sends user gestures to it: drag, connect, the **+** menus, delete, select.
- **Right-hand panel.** It has three modes:
  - **Step editor:** reuses today's per-Step form (component, scheme/path, options, Connection, Message, Route), cut down to edit one Step at a time. A Router shows its kind as its component, read-only: changing it means deleting the Router and adding another.
  - **Minimap:** below the editor, a minimap of the whole Flow. Clicking or dragging on it moves the view of the canvas.
  - **Link editor:** Branch name, Condition, and advanced transport and pattern.
  - **Flow settings:** name, notes, log level, Integration, Error Step.
- **Auto-arrange** lays the tree out left to right, from the Source on the left to the Sinks on the right, in the n8n style.
- **An unsaved-changes guard** runs when the user navigates away from the designer.
- **Start actions check Draft status.** The start and auto-start actions on the Flow overview disable themselves for a Draft.
- **The form-based editor stays for Script and Route Flows**, which are built from SCRIPT and ROUTE Steps that the canvas doesn't place. Every other Flow opens on the canvas. `flow.type` is unchanged, so DIL output is unchanged.
- **Unsaved changes:** leaving the editor (in the app or by closing the tab) asks for confirmation.

### Saving

- **One Save action persists the whole Flow.** It creates or updates Steps first, then replaces the Flow's Links, the same order as today.
- **New Link naming: `{flowId}-{downstreamStepId}`.** Today the name is `{flowId}-{upstreamStepId}`, which gives every Branch of a Router the same name. The new name is unique because every Step has at most one inbound Link. It also matches DIL's convention, where a Link's id is the id of the Step it leads to. Existing Links are renamed the next time their Flow is saved.
- **Save uses the existing Step and Link REST resources.** No new endpoint is introduced in this spec.

### Schema changes (Liquibase)

- **Link:** add a `language` column (string, nullable).
- **Step:** add `coordinate_x` and `coordinate_y` columns (nullable numbers). If they're empty, the Flow is laid out automatically when it opens.
- **The DTOs and mappers** for Link and Step carry the new fields.

### DIL export and import

- **Export writes each Link's** `rule`, `language`, `expression` and `pattern` (alongside `id`, `transport` and `bound`, as today). Fields that are empty are left out.
- **Export writes each Step's coordinates** as the `coordinates` element (`x`, `y`), which the runtime's `dil.xsd` already allows on a step. We won't invent a new `position` element, because the runtime validates DIL strictly against its schema.
- **Import reads** `language` and `coordinates` in addition to what it reads today (it already reads `pattern`, `rule` and `expression`).
- **On save, the designer drops a split Router's copy of its Condition from the Router's options.** The `split` Link is the source of truth.

## Testing Decisions

- **What makes a good test here:** it only checks behaviour you can observe at the seam: the graph you get back after an operation, the Steps and Links that would be saved, the rejection reason, and the DIL produced by export. It never checks how the canvas component is wired internally or what Foblex renders.
- **Seam A: the Flow graph model (frontend, Jest).** This is the main seam. It covers:
  - building from Steps and Links: straight lines, every Router kind, broken Links, unsupported Step types, empty Flows
  - every operation and its rejections: second inbound Link, loop, outbound Link from a Sink, inbound Link into the Source, deleting the Source or a structural Link
  - the deletion rules for Action, Router and Branch Sink
  - Branch shape per Router kind, including inserting a Router into the middle of a Flow
  - Draft detection
  - undo and redo
  - serialization, including the `{flowId}-{downstreamStepId}` Link naming
  - Prior art: the existing `*.spec.ts` files under the webapp (services and components using Jest).
- **Seam B: DIL round trip (backend, JUnit).** Import a DIL Flow through the Import entry point, export it again through the Export entry point, and check that the Router Links keep `rule`, `language`, `expression` and `pattern`, and that Steps keep their `coordinates`. Fixtures are trimmed, anonymized Flows based on the reference examples: content router, if/else, split, recipient, enrich, and an empty Flow with only an Error Step. They're committed under the test resources; the reference `examples/` folder itself stays uncommitted. Prior art: the domain, DTO and mapper unit tests for Flow (there are no tests for Import or Export yet).
- **The canvas component** only gets a smoke test: it renders a given graph and opens the right panel for a selected node.

## Out of Scope

- Joins, loops and Flows with more than one Source (ADR 0001).
- Changing the DIL runtime or its schema. Everything here fits what the runtime already understands.
- Editing the other Step types (FROM, TO, ROUTE, MESSAGE, SCRIPT, API, CONNECTION, GET/POST/PUT/PATCH/DELETE) on the canvas.
- Autosave, collaborative editing, and undo history that survives a reload.
- Converting a Step between kinds in place (Action ↔ Router, Fixed-slot ↔ List Router).
- A new atomic "save whole Flow" backend endpoint.
- Changes to the Flow overview beyond disabling start and auto-start for Drafts.

## Further Notes

- **Drag-to-connect was dropped (story 18).** In a Flow that follows ADR 0001 every Step except the Source already has its one inbound Link, so any Link drawn by hand would be refused. Links are only created by inserting Steps and adding Branches; connectors on the canvas are not draggable.
- **The backend test setup** was made runnable against the current setup: the test configuration mirrors the application configuration, including no Hibernate schema validation (the application doesn't validate either). The old JHipster-generated tests are not maintained; new tests are written against the DIL format, the Liquibase schema and the current configuration.

- These decisions come from a grilling session on the `visual-designer` branch. Its last round (where Conditions live, empty Flows, deletion rules, kind changes, storing positions, undo and unsaved changes, the ADR) was accepted as recommended.
- The 159 reference Flows in the uncommitted `examples/` folder all follow the tree rule. The Router kinds actually used are content, if, split, splitandaggregate, enrich, recipient and wiretap.
- Auto-arrange running left to right (n8n style) is an assumption and easy to change.
- Saving is not atomic: it's a sequence of REST calls, as it is today. If that turns out to be fragile (a half-saved Flow after a failed request), a single "save whole Flow" endpoint is the natural next step.

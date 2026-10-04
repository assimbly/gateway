# Spec: Flows UX

> Status: ready for implementation, in six independent slices.
> Vocabulary follows the root `CONTEXT.md`. Architectural constraints: ADR 0001, "A Flow is a tree", and ADR 0002, "Every Endpoint is edited the same way".

## Problem Statement

Assimbly stands for "A Self-Service Integration Module". The Flows section should let a new user design, start and check an integration without documentation. Today it gets in their way:

- **There are two ways in.** The sidebar lists *Manage, Design, Editor, Script, Send, Variables*, and the Add menu offers *Flow, Route, Script*. Both lead to the same three editors. "Editor" means the Route editor. Opening an existing Flow highlights *Design*, and nothing leads back to the list.
- **"Add → Route" says the wrong thing.** Every row in the list is a Flow, but the menu presents Route and Script as peers of Flow. In the glossary a Route is something a Step refers to.
- **You can't read the state of a Flow.** The status is only a colour on three icon buttons. A Draft is not marked, and its Start button is just disabled. "—" means both "never ran" and "zero".
- **Building and running are separate places.** After saving, the user goes back to the list, finds the Flow and presses play, and then can't see from the editor whether it works.
- **"No code by default" isn't true yet.** The step picker is a flat, alphabetical list of hundreds of raw Camel ids. The Path's syntax hint disappears as soon as you type, and Option keys are raw names.
- **Alerts are a dead end.** They're raw lines in a modal, with no way to act on them or clear them.
- **Import is hidden.** Export is in each row's menu, Import only under *Administration → Gateway*.
- **An empty Gateway** shows an empty table with one line of text.

## Solution

Small changes that work with any Camel component, no rewrite. They target the **integration specialist / citizen developer**: someone who knows REST, queues and SFTP but not Camel URI syntax. Camel engineers keep their escape hatches: every component, the raw path, typed Option keys, and Route and Script Flows.

1. **Sidebar, New Flow dialog and empty state.** One way to create a Flow: a dialog that asks for its **Flow type** (Visual, Script, Route) or imports one from a file.
2. **The Flows list** shows each Flow's type and **Flow status** in words, with one main action that fits the state.
3. **One editor header** for all three Flow types: breadcrumb with the name editable in place, Flow status, counters, Start/Stop, Save / Save & start, Send test message.
4. **The step picker** uses the Camel catalogue's titles, descriptions and labels, and only lists components that fit the Step's role.
5. **Endpoint editing** keeps `component:path?options` with key–value Options, but shows the path syntax as a persistent hint, describes each Option, and gives each value a field that fits its type.
6. **An Alerts drawer** with Open Flow and Clear.

## User Stories

### Slice 1: Sidebar, New Flow dialog and empty state

1. As a new user, I want the Flows section of the sidebar to contain only **Flows**, **Test message** and **Variables**, so that the navigation shows places, not actions.
2. As a user, I want the sidebar to keep *Flows* highlighted while I'm editing a Flow, so that I always know where I am.
3. As a user, I want **Add** to open a **New Flow** dialog that asks how I want to build it, **Visual** (no code, recommended), **Script** (low code) or **Camel route** (code), each with one line saying who it's for, so that I pick the right editor without knowing the jargon.
4. As a user, I want **Import from file** as a fourth choice in that dialog, accepting what a row's Export produces, so that importing sits next to creating.
5. As a first-time user, I want an empty Gateway to show the three Flow types as cards plus an "Import a Flow" link, instead of an empty table, so that I know where to start.

### Slice 2: The Flows list

6. As an operator, I want a **status pill** on every row (Running, Paused, Stopped, Error, or Draft), so that I can read the state of every Flow without decoding button colours.
7. As an operator, I want **one main action that fits the state** (Start when Stopped or Error, Stop when Running, Resume when Paused), with Pause and Restart in the ⋮ menu, so that each row has one obvious thing to do.
8. As a user, I want a Draft to show `Draft · Finish design` (linking to its editor) instead of a disabled Start button, so that I know why it can't run and what to do about it.
9. As a user, I want to see each Flow's **Flow type** (Visual, Script, Route), so that I know which editor will open.
10. As an operator, I want Completed and Failed to show `0` once a Flow has been started and `—` only when it has never run, so that "nothing yet" and "none" look different.

### Slice 3: The editor header

11. As a user, I want a single thin header row on every editor: breadcrumb `Flows / <name>` on the left, with the name editable in place, so that I can go back to the list and rename the Flow without a separate name field.
12. As a user, I want the Flow status, the Completed / Failed counters and the Alert badge in the editor header, so that I can tell from the editor whether my Flow is working.
13. As a user, I want **Save** and a split **Save & start**, plus **Start/Stop**, in the editor header (disabled with a tooltip while the Flow is a Draft), so that I can build and run a Flow without leaving the page.
14. As a user, I want **Send test message** in the editor header and in the row's ⋮ menu, opening the Test message page prefilled with the Flow's Source, so that I can try a Flow in two clicks.
15. As a user of Script and Route Flows, I want the same header with Save at the top right, so that every editor works the same way.

### Slice 4: The step picker

16. As a user, I want each component in the picker shown with its **title** and **one-line description** from the Camel catalogue, with the raw id small and muted, so that I can recognise "ActiveMQ 6.x" without knowing `activemq6`.
17. As a user, I want **category chips** built from the catalogue's labels (sorted by size, the long tail behind "More") and a **Recently used** chip, so that I can narrow hundreds of components down quickly.
18. As a Camel engineer, I want every component Camel offers to stay available, and search to cover title, id and description, so that nothing is hidden from me.
19. As a user, I want the Source tab to only list components that can receive messages, and the Action and Sink tabs only components that can send them, so that I can't build a Flow that fails at runtime. Search still finds a hidden component, but greys it out with the reason.

### Slice 5: Endpoint editing

20. As a user, I want the Component's path syntax (for example `sftp:host:port/directoryName`) shown as a persistent hint under the Path field, and each path part's description in the ⓘ tooltip, so that I know what to type without the Camel docs.
21. As a user, I want the Option key list to show each Option's **display name and description**, grouped as Common / Advanced / Security, so that I can find the setting I need.
22. As a user, I want the value field to fit the Option's type (a switch for a boolean, a dropdown for an enum, a number field for a number, a masked field for a secret) and to show its default as the placeholder, so that I enter valid values.
23. As a user, I want a Component's required Options added as empty rows marked "required", with a warning on the Step until they're filled, so that I see what's needed without being blocked when a Connection supplies them.
24. As a user, I want a Flow with an empty required path part to be a Draft, so that an Endpoint that can't exist never runs.
25. As a Camel engineer, I want to still type any Option key by hand, so that Options the catalogue doesn't know keep working.

### Slice 6: Alerts

26. As an operator, I want the Alert badge to open a **side drawer** for that Flow, newest first, with relative times (full timestamp on hover) and long messages shortened to one line until I expand them, so that I can scan what went wrong.
27. As an operator, I want **Open Flow** in the drawer, so that I can go straight from an alert to the Flow.
28. As an operator, I want **Clear** in the drawer to clear the Flow's alerts for everyone, so that a handled problem stops showing as one.

## Implementation Decisions

### Generic, catalogue-driven (ADR 0002)

- Everything the picker and the Step editor show comes from the Camel catalogue at runtime: `title`, `description`, `label`, `syntax`, `consumerOnly` / `producerOnly` per component (all already in `shared/camel/component-type.ts`), and each Option's `kind`, `displayName`, `group`, `type`, `enum`, `defaultValue`, `required`, `secret` and `description` from the component schema the backend serves (`/flow/schema/{component}`).
- No component gets custom UI, and there's no hand-maintained mapping table (categories, "common" lists or groupings). **Recently used** is the only list that isn't from the catalogue. It's kept per browser in `localStorage` and works without it.
- The schema's `group` values are folded into three headings: `common`, and the role's own `consumer` or `producer` group, → Common; groups containing `security` → Security; everything else → Advanced. Options that only apply to consumers or producers (by `group` or `label`) are filtered by the Step's role. The schema endpoint doesn't filter them itself.
- A number value is a text field with a numeric keyboard and an enum value keeps any value it already has, so property placeholders keep working.

### Flow type

- `flow.type` stays as it is (`flow`, `route`, `script`). The UI calls them **Visual**, **Route** and **Script**. A Flow's type never changes: Clone keeps it, and switching type means creating a new Flow.
- The sidebar's Design, Editor and Script links are removed. The editor routes stay, so links to `/flow/editor?...` and deep links keep working.

### Flows list

- The status pill comes from the existing status in the row component (`active` → Running, `paused` → Paused, `inactive` → Stopped, `inactiveError` → Error). A Draft is shown in the same spot, but it isn't a Flow status: Drafts have none. The `statusTone` colours are reused for the pill.
- `jhi-status-controls` gets a mode with a single main button, and its secondary actions move into the row's existing `jhi-row-actions` menu.
- "Has been started" (for `0` vs `—`) is true once the runtime reports a status other than `unconfigured` for the Flow. (The statistics endpoint answers with zero counters even for a Flow that never ran, so it can't tell.) After a Gateway restart a Flow shows `—` again until it is started.

### Editor header

- One header component is shared by the canvas editor and the Script/Route form editor. It replaces the canvas's name input row and the forms' bottom Cancel/Save buttons. Cancel becomes the breadcrumb's back link, which goes through the existing unsaved-changes guard.
- Save & start saves, then starts. If the start fails, the Flow stays saved and the status shows Error.
- Send test message navigates to the Test message page with the Flow's id in the query. The page reads the Flow's Source (component, path, options) and prefills its Endpoint. The button is enabled only while the Flow is Running and its Source's component isn't `consumerOnly`: a test message is sent *to* the Source's Endpoint, so its component has to accept messages (a Scheduler or Timer Source can't).

### Import from file

- Uses the existing single-Flow import (`POST /environment/{integrationId}/flow/{flowId}`, `Import.convertFlowConfigurationToDB`). **Verified:** `{flowId}` picks which `<flow>` in the file to import, so the dialog reads it from the file. The import matches Flows by name: it creates a Flow when none has that name, and otherwise replaces the one that does. Before replacing, the dialog looks the name up (`GET /flows/byname?name=`) and asks the user to confirm. An export ends in `</dil>`, which the import used to skip (it read a stale field), so importing an export failed until that was fixed.

### Alerts

- Alerts are read from per-Flow files under `{baseDirectory}/alerts/{flowId}/*_alerts.log` (`FlowAlertLogService`). Each alert is a single line `timestamp : message`, so there's no Step reference and no separate stack trace.
- **Clear** adds `DELETE /flows/{id}/alerts`. It moves the Flow's alert files into a `cleared/` subfolder of that Flow's alert directory (which `page()` already skips, because it only reads regular files in the Flow's directory). Nothing is deleted, so a cleared alert can still be found on disk.
- The drawer reuses the existing paging of `/flows/{id}/alerts`.

### Theme and layout

- The existing System / Light / Dark theme selector stays as it is. New UI uses the existing theme tokens, so it works in both themes.
- There's no new page title on the Flows list: the search + Add toolbar is the header.

## Testing Decisions

- **What makes a good test here:** it only checks behaviour you can observe at a seam: what a pure function returns, the request a component sends, and the files on disk after a backend call. It never checks markup details or styling.
- **Catalogue helpers (frontend, Jest).** Write pure functions and test them:
  - category chips from labels (counts, components with several labels)
  - role filtering from `consumerOnly` / `producerOnly`
  - grouping Options into Common / Advanced / Security
  - choosing the value field type (boolean, enum, number, secret, fallback to text)
  - required path parts (from `syntax` and the schema's path `kind`) feeding the Draft check
  - Prior art: `flow-graph.spec.ts`, `step-picker.component.spec.ts`.
- **Flows list mapping (Jest).** Status → pill and main action, Draft → `Draft · Finish design`, `0` vs `—`.
- **Clear alerts (backend, JUnit).** Against a temporary alerts directory: after Clear the page is empty, and the files exist under `cleared/`. Prior art: the package-private `FlowAlertLogService(Path)` constructor exists for this.
- **The header component** gets a smoke test: Save & start is disabled for a Draft, and the breadcrumb renames the Flow.

## Out of Scope

- Per-component forms (ADR 0002).
- Per-Step counters on canvas nodes. They need per-Step metrics from the runtime.
- Linking an alert to the Step that failed. Alerts carry no Step reference.
- A "Start from an example" card. It comes once a curated set of 5–10 example Flows is committed and packaged.
- Converting a Flow between types, and moving Script and Route Flows onto the canvas.
- Changing the theme system, or adding new themes.
- Changes outside the Flows section (Broker, Administration).

## Further Notes

- These decisions come from a grilling session on the `visual-designer` branch on 2026-10-04, based on a walkthrough of the running UI. Every recommendation was accepted. Where the user changed one, it was to keep every component available and keep Options as key–value (which led to ADR 0002), and to keep the header minimal, without a new page title.
- The slices are listed in the order of most adoption impact for the effort. Each one ships on its own: slices 4 and 5 don't depend on 1–3, and slice 6 only reuses the drawer pattern.

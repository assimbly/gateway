# Spec: REST API Builder

> Status: ready for implementation.
> Vocabulary follows the root `CONTEXT.md` (see its **APIs** section). Architectural constraints: ADR 0001, "A Flow is a tree"; ADR 0002, "Every Endpoint is edited the same way"; ADR 0003, "An Operation is the Source of its Handler Flow"; ADR 0004, "The API model is the source of truth, not OpenAPI".

## Problem Statement

Integration developers can already serve a REST call from Assimbly, but only indirectly, one Flow at a time:

- A Visual Flow can have a `rest` Source (method + path) or an `https` Source, but nothing groups those Flows into an API. There's no place to see "the Customers API" with its `GET`, `POST`, `PUT` and `DELETE` together.
- The contract lives nowhere. Parameters, request and response schemas and possible status codes aren't recorded, so there's no OpenAPI document to give to the people calling the API, and no way to start from one they gave you.
- What the caller gets back is accidental: whatever the message happens to be when the Flow ends, always with status `200` unless someone sets a Camel header by hand. A failure returns whatever Jetty makes of the exception.
- Nothing stops two Flows from claiming the same method and path.
- Leftover `API`, `GET`/`POST`/`PUT`/`PATCH`/`DELETE` and `RESPONSE` Step types hint at an earlier attempt, but no Flow uses them and the designer can't edit them.

## Solution

An **API** becomes a first-class object in the Gateway, next to Flows. An API has a name, a base path and a version label, and is made up of **Operations**, such as `GET /customers/{id}`. Each Operation records its parameters, its request schema and its **Declared responses**.

Every Operation is handled by exactly one **Handler Flow**: an ordinary Visual (or Script) Flow whose Source *is* the Operation (ADR 0003). Everything after the Source is the existing designer: validate, transform, call SAP, a database or a queue, or **Call Flow** to hand the request to an existing Flow and use its answer. The request ends at a **Response** Sink, which sets the status code, headers and body the caller receives. A failure no Step handles answers `500` with a `problem+json` body.

The API model is the source of truth (ADR 0004). **Export** generates an OpenAPI 3.0.3 document from it. **Import** turns an OpenAPI 3.0 or 3.1 document into a new API, with one Draft Handler Flow per Operation.

The runtime is unchanged. Each Handler Flow deploys as a normal DIL Flow with a `rest` Source; the runtime never sees the API itself.

## User Stories

### APIs and Operations

1. As an integration developer, I want an **APIs** section in the sidebar, next to Flows, so that APIs have their own home.
2. As an integration developer, I want a list of APIs showing name, base path, version, API status and number of Operations, so that I can see every API I serve at a glance.
3. As an integration developer, I want to create an API with a name, a base path and a version label, so that I can start designing an interface before any Flow exists.
4. As an integration developer, I want an API page with a table of its Operations (method badge, path, summary, Handler Flow status), so that the API reads like its documentation.
5. As an integration developer, I want to add an Operation by choosing its method, path template and Flow type (Visual by default, or Script), so that a working Handler Flow is created for it in one step.
6. As an integration developer, I want a new Operation's Handler Flow to start as Operation → Response (`200`, keep body), so that it answers right away and I build from there.
7. As an integration developer, I want saving to be refused when an Operation's method and full path (base path + path) already exist in any API, so that two Flows never claim the same request.
8. As an integration developer, I want the base path of an API to be unique across APIs, so that APIs don't overlap.
9. As an integration developer, I want to delete an Operation, and have its Handler Flow deleted with it after I confirm, so that nothing is left behind.
10. As an integration developer, I want to delete an API, and have all its Operations and Handler Flows deleted after I confirm, so that removing an API is one action.

### Describing an Operation

11. As an integration developer, I want clicking an Operation to open a side panel with its details, so that I can describe it without leaving the API page.
12. As an integration developer, I want to give an Operation a summary, a description and an `operationId`, so that the generated OpenAPI document is useful to callers.
13. As an integration developer, I want path parameters to be added automatically from the path template (typing `/customers/{id}` adds `id`, required, which I can't remove), so that the path and its parameters never disagree.
14. As an integration developer, I want to add query and header parameters as rows (name, in, type, required, description), so that callers know what they can send.
15. As an integration developer, I want to set one request media type and one response media type per Operation (default `application/json`), so that the contract says what goes in and out.
16. As an integration developer, I want to edit the request schema as JSON Schema in a code editor, so that I can describe the body precisely.
17. As an integration developer, I want to generate a schema from an example JSON body, so that I don't have to write JSON Schema by hand.
18. As an integration developer, I want to list an Operation's Declared responses (status, description, optional media type and schema), so that callers know every answer they can get.
19. As an integration developer, I want an **Open Handler Flow** button in the Operation panel, so that I can go straight from the contract to the logic.

### Handler Flows

20. As an integration developer, I want Handler Flows to appear in Flows → Manage, marked with their API and Operation, so that status, Alerts and Test messages work exactly as for any Flow.
21. As an integration developer, I want a Handler Flow's Source to be locked on the canvas and to show its Operation (method and full path), so that the contract is only changed in one place.
22. As an integration developer, I want changes to an Operation's method, path or parameters to update its Handler Flow's Source, so that the deployed Flow always matches the contract.
23. As an integration developer, I want deleting a Handler Flow on its own to be impossible (I'm pointed to its Operation instead), so that no Operation is left without a handler.
24. As an integration developer, I want cloning a Handler Flow to give me an ordinary Flow with a placeholder Source, so that I can reuse its logic without two Flows claiming one Operation.
25. As an integration developer, I want to add a **Response** Sink to a Handler Flow and set its status code, headers and body (an expression, or keep the current body), so that I decide exactly what the caller receives.
26. As an integration developer, I want the Response's status field to offer the Operation's Declared responses, while letting me type any status, so that I stay close to the contract without being blocked.
27. As an integration developer, I want a warning when a Response uses a status that isn't a Declared response, so that I notice when the logic and the contract drift apart.
28. As an integration developer, I want a Handler Flow to be a Draft while any Branch that ends the request doesn't end in a Response, so that an Operation never runs without answering.
29. As an integration developer, I want content and if Routers to be able to answer differently per Branch (for example `200` on one, `404` on another), so that I can model "found" and "not found".
30. As an integration developer, I want Branches of call-out Routers (enrich, split, loop, wiretap) to end in ordinary Sinks, because they return to their Router, so that only the real end of the request needs a Response.
31. As an integration developer, I want a **Call Flow** Action that sends the message to another Flow and carries on with its answer, so that an Operation can reuse an existing Flow: Operation → Call Flow → Response.
32. As an API caller, I want an unhandled failure to answer `500` with an `application/problem+json` body containing a title, the Operation and a correlation id, and never an exception message or stack trace, so that errors are predictable and safe.
33. As an operator, I want the correlation id in a `500` answer to match the Flow's Alert, so that I can find what went wrong for a caller.

### Running an API

34. As an operator, I want an API's status to be a summary of its Handler Flows ("3 of 4 Operations running, 1 Error"), so that I can see its health without opening every Flow.
35. As an operator, I want to start and stop a whole API, which starts and stops all its Handler Flows, so that I don't have to do it Flow by Flow.
36. As an operator, I want Draft Handler Flows to be skipped when an API is started, and the result to say how many were skipped, so that one unfinished Operation doesn't block the rest.
37. As an integration developer, I want a **Try it** form in the Operation panel (parameter fields, a body pre-filled from the request schema's example, Send), showing the returned status, headers and body, so that I can check the Operation end to end through its real path.

### OpenAPI

38. As an integration developer, I want to import an OpenAPI 3.0 or 3.1 document (JSON or YAML) by uploading a file or pasting it, so that I can start from a contract someone gave me.
39. As an integration developer, I want an import to create the API, its Operations with their parameters, schemas and Declared responses, and one Draft Handler Flow per Operation (only the Operation Source, with an open end), so that I only have to build the logic.
40. As an integration developer, I want each imported Handler Flow named after its `operationId`, or its method and path when there's none, so that I can find it in the Flows list.
41. As an integration developer, I want an import to list everything it dropped (extensions, examples, security schemes, servers, callbacks and anything else the model doesn't hold), so that I know what didn't come across.
42. As an integration developer, I want the whole import refused, with the conflicts listed, when any of its Operations clashes with an existing one, so that an import never half-succeeds.
43. As an integration developer, I want a Swagger 2.0 document to be rejected with a message saying only OpenAPI 3.0 and 3.1 are supported, so that I know to convert it first.
44. As an integration developer, I want to export an API as an OpenAPI 3.0.3 YAML document (JSON on request), so that I can give callers its contract.
45. As an integration developer, I want the export's `servers` to point at the Gateway's REST listener with the right path prefix, so that callers can use the document directly in Postman or a code generator.
46. As an integration developer, I want every exported Operation to include a `500` problem response, even if I didn't declare one, so that the contract tells the truth about failures.
47. As an integration developer, I want an imported request or response schema to be exported unchanged, so that import → export doesn't lose my types.

### Backup

48. As an operator, I want the Gateway's export of an Integration to include its APIs, and its import to restore them with their Handler Flows linked, so that a backup round-trips without orphaned Handler Flows.

## Implementation Decisions

### Domain rules

- **API.** Name (required, unique), base path (required, starts with `/`, unique across APIs, no parameters in it), version label (free text, documentation only, written to `info.version`), description.
- **Operation.** Belongs to one API. Method (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `HEAD`, `OPTIONS`), path template (starts with `/`, may be `/`; parameters as `{name}`), `operationId` (optional, unique within its API), summary, description, request media type, response media type, request schema (JSON Schema text, optional), parameters, Declared responses, and exactly one Handler Flow.
- **Full path** is base path + path template, normalized (no double or trailing slashes, except a lone `/`). **Method + full path is unique** across all Operations of all APIs. Two templates that differ only in parameter names (`/c/{id}` and `/c/{key}`) count as the same path.
- **Parameters.** Name, in (`path`, `query`, `header`), type (`string`, `integer`, `number`, `boolean`), required, description. Path parameters are derived from the path template on every edit: they can't be added, removed or made optional by hand, only described and typed.
- **Declared response.** Status code (a number from 100 to 599, or `default`), description (required, as OpenAPI requires), optional media type and schema. Unique per Operation by status.
- **Handler Flow.**
  - Its Flow type is Visual or Script, chosen when the Operation is created; it never changes.
  - Its Source is the Operation. On the canvas the Source shows the method and full path, and its Endpoint can't be edited or swapped.
  - It can't be deleted on its own. Deleting its Operation deletes it after a confirmation, and deleting the API deletes all of them.
  - Cloning it gives an ordinary Flow whose Source is an empty placeholder (so the clone is a Draft).
- **Response** is a Sink kind that exists only in Handler Flows: status code (default `200`), headers (key–value rows), and body (an expression with its language, or "keep current body"). The response media type of the Operation is set as `Content-Type` unless a header overrides it.
- **Where a Response is required.** In a Handler Flow, every Branch that ends the request ends in a Response, otherwise the Flow is a Draft. A Branch ends the request unless it returns to its Router: the named Branch of a call-out Router (enrich, split, splitandaggregate and the namespace variants, loop, dowhile) and the wiretap Branch don't, so they end in ordinary Sinks. A Response anywhere else in a Handler Flow (on a returning Branch) is refused by the canvas.
- **A Response with an undeclared status** shows a warning on the Step, not a Draft (the same treatment as required Options in ADR 0002).
- **Call Flow.** One component in the step picker, available as an Action and as a Sink. As an Action it is InOut and continues with the target Flow's answer. As a Sink it hands the message over (InOnly by default) and the Branch ends there. Options: target Flow (picked from a list of Flows, stored as its id), transport (sync or async).
- **API status** is computed, never stored: counts of its Handler Flows' Flow statuses, with Drafts counted separately.
- **Start/Stop API** starts or stops every Handler Flow; Drafts are skipped and reported. Auto-start stays a per-Flow setting.

### Backend

- **New JPA entities and Liquibase changesets:**
  - `api`: id, name, base_path, version_label, description, integration_id.
  - `api_operation`: id, api_id, method, path, operation_id, summary, description, request_media_type, response_media_type, request_schema (clob), handler_flow_id (unique, not null). A unique constraint on method + normalized full path is not possible across tables, so it is checked in the service layer.
  - `api_parameter`: id, operation_id, name, location, type, required, description.
  - `api_declared_response`: id, operation_id, status, description, media_type, schema (clob).
  - A Flow doesn't get a back-reference column. "Is this Flow a Handler Flow?" is answered by looking it up in `api_operation`.
- **New REST resources** following the existing `web/rest/gateway` style: CRUD for APIs, CRUD for Operations under an API (creating an Operation creates its Handler Flow in the same transaction), `POST /apis/{id}/start` and `/stop`, `POST /apis/import` (body: the document text), `GET /apis/{id}/openapi?format=yaml|json`.
- **Conflict check** in one service method, used by Operation create/update, API base path update and import: normalize the full path, replace every `{param}` with `{}`, and compare with the method.
- **Keeping the Source in sync.** Saving an Operation rewrites its Handler Flow's Source Step: component `rest`, options `method` (lower case) and `path` (the full path, see "Path prefix" below). The Flow is not restarted automatically; as with any Flow edit, the change takes effect when it's restarted.
- **Deleting guards.** The Flow delete endpoint refuses a Handler Flow with a message naming its Operation.
- **OpenAPI import** uses `io.swagger.parser.v3:swagger-parser` (new dependency), which reads 3.0 and 3.1 in JSON and YAML and identifies Swagger 2.0 so it can be rejected. `$ref`s to `components/schemas` are resolved into each schema before it's stored, because the model keeps schemas per Operation. The import collects every part it doesn't map into a "dropped" list returned to the UI. No import by URL.
- **OpenAPI export** builds `io.swagger.v3.oas.models.OpenAPI` objects (swagger-core, already on the classpath through springdoc) and serializes them as 3.0.3 YAML or JSON. `servers` is one entry: the runtime's REST listener (`https://<gateway host>:9001`) plus the path prefix. Every Operation gets a `500` response with an `application/problem+json` schema (`type`, `title`, `status`, `detail`, `instance`, `correlationId`) unless one is declared.
- **Backup.** `Export`/`ExportXML` write an `apis` section per Integration (APIs, Operations, parameters, Declared responses, and each Operation's Handler Flow by Flow id). The importers get an `ImportXMLApis` that runs after Flows are imported and links Operations to the imported Flows.
- **Leftover enum values.** `StepType.API`, `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `RESPONSE` and `GatewayType.API` are not used by this feature. `POST("put")` is a bug, fixed separately.

### Runtime mapping (no runtime change)

- **Operation Source → `rest` Source.** DIL `uri: rest` with options `method`, `path` and `exchangePattern: InOut`. The runtime's `rest-source` kamelet turns that into `rest:<method>:<path>`, served by Jetty over HTTPS on `0.0.0.0:9001` (the runtime's REST configuration).
- **Path prefix.** The runtime's REST configuration has no context path, so the Gateway writes the prefix into each `path`: `/_<tenant>` + base path + Operation path when a tenant is set, the same convention as the `https` Sources in the reference Flows. Export uses the same prefix in `servers`.
- **Response → `setmessage` Sink.** The Response Step is stored and exported as a Sink with component `setmessage`: `headers` carries `CamelHttpResponseCode` (the status), `Content-Type` and the user's headers; `body` and `language` carry the body expression, or are left out for "keep current body". In a Handler Flow the designer shows a `setmessage` Sink on a Branch that ends the request as a Response. Elsewhere `setmessage` stays an ordinary component.
- **Call Flow → `flowlink`.** As an Action, `flowlink` with `transport`, `targetFlowId` and `exchangePattern: InOut` (the runtime's `flowlink-action` kamelet already supports this). As a Sink, the same with InOnly, as the reference Flows use it today. The target Flow needs a `flowlink` Source; Call Flow's target picker only offers Flows that have one.
- **`500` problem answer.** Handler Flows get a shared Route configuration (DIL `routeConfigurations`, referenced by `routeConfigurationId`) whose `onException` sets status `500`, `Content-Type: application/problem+json` and the problem body, with the exchange id as the correlation id. The Flow's Error Step still records the Alert.

### Frontend

- **New feature folder `entities/api`** with routes for the API list, the API page and import. A new **APIs** item in the navbar, next to Flows.
- **API list page:** table (name, base path, version, API status, Operation count), and New, Import OpenAPI, Export OpenAPI actions.
- **API page:** header form (name, base path, version, description), the Operations table, New Operation, Start and Stop.
- **Operation side panel:** method, path, operationId, summary, description; parameter rows (path rows derived and locked); request and response media types; request schema and Declared responses, each with a CodeMirror JSON editor (CodeMirror is already a dependency) and "Generate from example JSON"; **Try it**; **Open Handler Flow**.
- **Schema generation from an example** is a small pure function (types, required = present keys, arrays from their first element). It has no dependency.
- **Try it** sends the request from the browser to the runtime's REST listener through a Gateway proxy endpoint (`POST /apis/{id}/operations/{opId}/try`), so that the browser doesn't need to trust the runtime's certificate or deal with CORS. The proxy only calls the Operation's own full path on the configured runtime, never a URL from the request.
- **Flow graph model (`flow-graph.ts`):**
  - A graph knows whether it is a Handler Flow (and its Operation's method, full path and Declared responses).
  - The Source of a Handler Flow is locked: it can't be swapped or edited.
  - Draft detection gains the rule "every Branch that ends the request ends in a Response", using the call-out Router kinds already in `ROUTER_SHAPES`.
  - Appending a Sink on a Branch that ends the request offers Response first. Adding a Response on a returning Branch is rejected with a reason.
  - Validation reports an undeclared Response status as a warning.
- **Response editor** in the right-hand panel: status (a dropdown of Declared responses that also accepts any number), header rows, body (expression with language, or "keep current body").
- **Call Flow** appears in the step picker as one entry for Actions and Sinks, with a Flow picker instead of a raw `targetFlowId` field.
- **Flows → Manage** shows an API badge (API name, method and path) on Handler Flows; Delete is disabled with a tooltip pointing to the Operation; Clone produces a placeholder Source.
- **Script Flows** as Handler Flows: the Script editor shows the Operation as a locked Source.

## Testing Decisions

- **What makes a good test here:** it checks behaviour visible at a seam (the OpenAPI document produced, the API and Flows created by an import, the rejection and its reason, the DIL a Handler Flow exports to, the graph and validation problems returned by the Flow graph model), never how components are wired internally.
- **Seam A: Flow graph model (frontend, Jest), extending `flow-graph.spec.ts`.**
  - a Handler Flow's Source can't be swapped, edited or deleted
  - Draft when a Branch that ends the request has no Response; not a Draft when only returning Branches (enrich, split, wiretap…) end in ordinary Sinks
  - a Response on a returning Branch is rejected
  - an undeclared Response status gives a warning, not a Draft
  - a new Handler Flow (Operation → Response) is complete; an imported one (Operation only) is a Draft
- **Seam B: OpenAPI round trip (backend, JUnit).** Import committed fixture documents (a small CRUD API in 3.0 and in 3.1, one with `$ref` schemas, one with extensions and security schemes, one Swagger 2.0), then export, and check: Operations, parameters, Declared responses and schemas survive; dropped parts are listed; Swagger 2.0 is rejected; the added `500` response is present; `servers` carries the prefix.
- **Seam C: Operation rules (backend, JUnit, service level).** Method + full path conflicts across APIs (including `{id}` vs `{key}`), base path uniqueness, path parameters derived from the template, Handler Flow created with the Operation and deleted with it, the Flow delete guard, and the Source rewritten on save.
- **Seam D: DIL export of a Handler Flow (backend, JUnit).** A Handler Flow exports a `rest` Source with the full prefixed path and `InOut`, a Response as `setmessage` with `CamelHttpResponseCode`, Call Flow as `flowlink` Action with `InOut`, and the problem Route configuration reference.
- **Backup round trip (backend, JUnit):** export an Integration with an API and import it again; the Operations point to the imported Handler Flows.
- **Prior art:** `flow-graph.spec.ts` and the DIL round-trip tests from the visual designer work. The old JHipster tests are not revived; new tests are written against the Liquibase schema, DIL and the current configuration.

## Out of Scope

- Authentication and authorization of API callers: API keys, OAuth2, JWT. This needs its own design.
- Rate limiting and quotas.
- Validating requests or responses against their schemas, and per-Operation error mapping (for example a validation failure → `400`).
- Versioning beyond a label (several live versions of one API, version in the path or a header).
- Per-API metrics, request tracing, and a hosted documentation page.
- Re-importing a changed OpenAPI document into an existing API (merge).
- Import by URL.
- Answering `503` for an Operation whose Handler Flow is stopped (today it answers `404`, because the runtime doesn't register the path).
- Several Operations sharing one Handler Flow (ADR 0003).
- Route Flows as Handler Flows.
- Changing the DIL runtime or its schema.
- Path-conflict checks for stand-alone `rest` and `https` Sources outside any API.

## Further Notes

- These decisions come from a grilling session on the `visual-designer` branch; every round was accepted as recommended.
- **Known risk: v1 APIs are unauthenticated.** Anyone who can reach port 9001 can call them, exactly as with today's `rest` and `https` Sources. This should be stated in the release notes until authentication lands.
- **Stand-alone `rest` and `https` Sources stay** (ADR 0002: every Component remains available). They belong to no API and don't appear in any export.
- **To verify early in implementation, because the design leans on them:**
  - that `setmessage` with no `body` keeps the current body, and that a `CamelHttpResponseCode` header set by it reaches Jetty as the status;
  - that a Route configuration's `onException` applies to the routes built from kamelets, and replaces Jetty's default error answer;
  - that the `/_<tenant>` prefix convention used by the `https` Sources is what callers of a `rest` Source should see too.
  If any of these fails, the fallback is a small runtime change (a `response` kamelet, or a REST error handler), which would move "no runtime change" from a decision to a preference.
- The runtime also has a `restopenapi-source` kamelet (`rest-openapi:<spec>#<operationId>`). It isn't used here: it ties the runtime to a stored OpenAPI document, which is the contract-first approach ADR 0004 rejects.

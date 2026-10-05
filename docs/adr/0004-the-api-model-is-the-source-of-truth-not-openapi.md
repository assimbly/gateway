# The API model is the source of truth, not OpenAPI

An API is stored as Assimbly's own model (API, Operations, parameters), and its OpenAPI document is generated from that model on export. Importing an OpenAPI document converts it into the model once. We considered contract-first, which stores the OpenAPI document itself and derives Operations from it. That gives perfect round-trips, but every change in the builder would become a YAML edit, and the builder would turn into a YAML editor with a canvas attached. To keep import → export from losing the parts users care about most, each Operation keeps its request and response schemas as opaque JSON Schema and writes them back out unchanged.

## Consequences

- Anything else in an imported document that the model doesn't understand (such as `x-` extensions, examples, security schemes or servers) is dropped, and the import lists what was dropped.
- Re-importing a changed document into an existing API isn't a merge in v1. If it's added later, it has to merge into the model, not replace it.
- New OpenAPI features reach the builder only when the model grows to hold them, for example authentication, which is planned as its own design.

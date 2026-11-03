Hi @davsclaus,

Thank you for putting together this design proposal and addressing the low-code / text-oriented integration challenges we discussed! Having a first-class `payloadMode` in `camel-core` hooked into the channel/processor pipeline (just like stream caching) and normalizing headers for remote endpoints like JMS is a great initiative.

Reviewing this from the perspective of our low-code platform (Fluxygen) and how non-Java users build integrations, there are a few fundamental areas where our users' mental model differs from the `payloadMode=json` (`JsonObject` in-memory) approach in the current doc. I’d love to share how low-code users expect this to work and suggest how we can align the design:

### 1. A Route is Rarely a Single Format (`payloadMode=true` vs `payloadMode=json`)
In the proposal, `payloadMode` is set to a single format for the entire route (e.g. `payloadMode=json`), and every step tries to turn the body into a `JsonObject`.

In real-world integrations, a single route almost always transitions between multiple formats. Take a typical Order integration:
1. `from("file:...")` (directory with `.json` files) -> Enters as **JSON** string
2. `log` -> Logs the **JSON**
3. `split(jsonpath)` -> Splits the JSON by order line (each split message is still a **JSON** string)
4. `setBody(groovy)` -> Modifies the JSON using `JsonSlurper` and returns a **JSON** string
5. `convert` (JSON to XML) -> Converts the payload from JSON to **XML** string
6. `log` -> Logs the **XML**
7. `to("xslt:...")` -> Performs an XSLT transformation on the **XML**
8. `to("cxf/spring-ws:...")` -> Sends the **XML** to a SOAP webservice

| Step | Action | Today's Camel (`default`) | Current PR (`payloadMode=json`) | Expected Low-Code Behavior (`payloadMode=true`) |
| :--- | :--- | :--- | :--- | :--- |
| **1. `from("file:...")`** | Reads `.json` file | `GenericFile<File>` | `JsonObject` (`LinkedHashMap`) | **`String`** (`Content-Type: application/json`, Type: `JSON`) |
| **2. `log`** | Logs payload | Logs file wrapper/content | Logs JSON string via `toDisplay` | Logs **`String`** directly |
| **3. `split(jsonpath)`** | Splits by order line | Each split body becomes `LinkedHashMap`! | Each split body is `JsonObject` (`Map`) | Each split body is serialized back to a **JSON `String`** (`Content-Type: application/json`) |
| **4. `setBody(groovy)`** | Uses `JsonSlurper` & returns String | Fails on step 3's `LinkedHashMap` (`parseText` expects `String`) | **Fails!** `JsonSlurper.parseText(body)` fails because `body` is a `JsonObject` (`Map`), not `String` | **Works!** `body` is a `String`, `JsonSlurper` parses it, and if Groovy returns a `Map` or `String`, it exits as a **JSON `String`** |
| **5. Convert JSON -> XML** | Converts format to XML | Requires `unmarshal().json()` -> `marshal().jacksonXml()`, outputs `byte[]` | **Broken conceptual model:** route is locked to `payloadMode=json`, so XML output doesn't fit the route's mode | First-class converter transforms JSON `String` -> **XML `String`** and updates `Content-Type: application/xml` (Type: `XML`) |
| **6. `log`** | Logs XML | Logs `byte[]` or String | Logs XML string | Logs **XML `String`** |
| **7. `to("xslt:...")`** | XSLT transform | Works if convertible to `Source`, outputs `String` or `DOM` | Works, leaves as XML String | Validates input is `XML`, runs XSLT, outputs **XML `String`** (`Content-Type: application/xml`) |
| **8. `to("cxf/spring-ws")`** | Send to SOAP service | Often requires `CxfPayload` or `Source` | Sends XML text | Sends **XML `String`** with `Content-Type: application/xml` |

**Suggestion:**
Instead of locking a route to one format (`payloadMode=json`), `payloadMode` should be a general mode (`payloadMode=true` or `payloadMode=text/raw`) enabled on the `CamelContext` or route. The **format of the payload is dynamic** and tracked on the Exchange via its `Content-Type` (and a high-level payload type such as `JSON`, `XML`, `CSV`, `Text`, `Binary`) as it moves from step to step.

### 2. Keep the Body as `String` / `byte[]` Between Steps (Not `JsonObject` / `Map`)
The proposal keeps the body *inside* the route as a parsed Java object (`JsonObject` / `JsonArray`, i.e., `LinkedHashMap` / `ArrayList`) and only turns it into text at the edges.

For low-code users, integration is technology-neutral: **everything is text (`String`) or binary (`byte[]`)**. Keeping the body as a `JsonObject`/`Map` between steps creates new surprises:
* In Step 4 above, when a user writes a Groovy script using `new JsonSlurper().parseText(body)` (or JavaScript `JSON.parse(body)`), it **fails** if Camel has secretly turned `body` into a `JsonObject` (`LinkedHashMap`)!
* In Step 3 (`split` with `jsonpath`), users expect each split item's body to be a valid JSON `String` (`{"sku":"123"}`), not a `LinkedHashMap`.
* If the body is an immutable `String` between steps, Camel also avoids the overhead and complexity of deep-copying mutable `JsonObject` trees on every `multicast`, `wireTap`, and `split`.

**Suggestion:**
In `payloadMode`, after **every step** (and at consumer ingress):
1. Unwrap component-specific Java objects (`GenericFile`, `InputStream`, `Response`, etc.) into a `String` (for text formats like JSON, XML, CSV, plain text) or `byte[]` (for binary formats like PDF, images).
2. If a step or expression (like `sql`, `jsonpath`, `xpath`, `groovy`) outputs a structured Java object (`Map`, `List`, `JsonObject`, DOM `Node`), **immediately serialize it back to a `String`** according to the step's active/configured `Content-Type` (e.g. if `Content-Type` is `application/json`, serialize `Map`/`List` to a JSON `String`; if `text/csv`, serialize `List<Map>` to a CSV `String`).
3. Same for headers: if `setHeader` with `jsonpath` produces a `List` or `Map`, serialize it to a `String` immediately so headers are always technology-neutral primitives/strings everywhere in the route, not just before remote endpoints.
4. For users/AI models who want dot-notation in Simple or Groovy without `JsonSlurper`, keep `body` as `String` (so scripts never break) and either encourage `${jsonpath($.sku)}` / `${xpath(/order/sku)}` or offer an explicit lazy binding like `payload.sku` / `${payload.sku}` that parses on demand based on `Content-Type`.

### 3. Format Detection & First-Class Format Conversions
How does Camel know the current format at each step?
1. **Priority order for determining `Content-Type`:**
   * Explicit step configuration / transformation output (e.g., a JSON-to-XML step sets `Content-Type` to `application/xml`)
   * Protocol `Content-Type` header (HTTP, JMS, etc.)
   * File extension via `MimeTypeHelper` on `CamelFileName` (`.json`, `.xml`, `.csv`, `.pdf`)
   * Lightweight content sniffing (`{` or `[` -> `application/json`, `<` -> `application/xml`, magic bytes -> binary, fallback to `text/plain`)
2. **Separate `marshal`/`unmarshal` (Java POJOs) from Format Conversion:**
   * Low-code users don't know what a Java POJO is, so "marshalling/unmarshalling" to/from a Java `Map` is confusing. Keep `marshal` and `unmarshal` for Java objects, and provide direct format-to-format conversions (e.g., `JSON <-> XML`, `CSV <-> JSON`, `YAML <-> JSON`) that take a `String`, return a `String`, and update the `Content-Type`.

### 4. Explicit Format Validation & Human-Readable Tracing (No Silent Fallbacks)
The proposal currently states: *"When `toData` throws, the engine leaves the body as it is and logs at DEBUG: the mode never fails a message."*

From a user perspective, silent fallbacks hide bugs:
* **Fail fast on format mismatch:** Each step has accepted input formats (e.g., `log` accepts `Any`; `split` with `jsonpath` requires `JSON`; `xslt` requires `XML`). If Step 3 (`jsonpath`) receives something that is not valid JSON, or Step 7 (`xslt`) receives non-XML, the user expects a clear error stating that the payload is not valid JSON/XML.
* **Catalog & Tracer Support:**
  * In the **Camel Catalog**, alongside Java class names, steps/EIPs/languages should declare accepted and produced format types (`JSON`, `XML`, `CSV`, `Text`, `Binary`, `Any` / MIME types) so low-code editors can validate links at design time.
  * In the **Tracer / Dev Console / Logs**, instead of displaying `java.lang.String` or `org.apache.camel.component.file.GenericFile`, expose the logical payload format (`JSON`, `XML`, `CSV`, `Text`, `Binary`) based on the message's `Content-Type`.

### Summary of Proposed Adjustments
1. Change `payloadMode` from a single static format (`json`) to a route/context mode (`payloadMode=true`) that tracks the format dynamically via `Content-Type`.
2. Normalize the message body and headers **to `String` / `byte[]` after every step** (unwrapping `GenericFile`/streams and serializing `Map`/`List`/`Node` using the active `Content-Type` plugin), rather than keeping `JsonObject` between steps.
3. Use the `PayloadMode` plugins (JSON, XML, CSV, Text, Binary) to handle:
   * Content-Type detection & sniffing
   * Serializing step outputs (`Map`, `List`, `Node`) to wire `String`/`byte[]`
   * Validating payload syntax when a step requires a specific format (throwing clear user-facing errors instead of logging at DEBUG)
   * Reporting the logical format name (`JSON`, `XML`, `CSV`, `Text`, `Binary`) to the Tracer and Catalog.

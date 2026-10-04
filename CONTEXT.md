# Assimbly Gateway

The Gateway is where users design, configure and run integration Flows. This glossary covers the vocabulary of designing a Flow.

## Flows

**Flow**:
A unit of integration logic: a tree of Steps joined by Links, starting at exactly one Source, with Flow-level settings such as error handling. Branches never merge and never loop back.
_Avoid_: Route (a Route is a separate thing: a hand-written Camel route a Step can refer to)

**Flow type**:
How a Flow is built, chosen when the Flow is created: **Visual** (Steps on the canvas, no code), **Script** (a Source, a script and an error handler, low code) or **Route** (a single Step that runs a hand-written Route, code). Every Flow has exactly one Flow type, and it never changes.
_Avoid_: Editor (the screen, not the kind of Flow); calling a Route-type Flow "a Route"

**Flow status**:
The runtime state of a Flow: Running, Paused, Stopped or Error (it couldn't start, or it stopped because of a failure). A Draft has no Flow status, because it can't run.
_Avoid_: Failed (that word counts failed messages), Active, Inactive

**Alert**:
An error a Flow reported while running. It stays until someone clears it, and clearing it clears it for everyone.

**Test message**:
A message a user composes by hand and sends to an endpoint, usually a Flow's Source, to try the Flow out.
_Avoid_: Send, message sender

**Draft**:
A Flow that has been saved but is not yet complete enough to run: a Step has no Component yet or is missing a required part of its path, or a Branch doesn't end in a Sink yet. Missing required Options don't make a Flow a Draft.

**Open end**:
A Source or Action that has no next Step yet. A new Flow is a single open end: its Source.

**Step**:
One node in a Flow that does a single job: receiving, transforming, routing or delivering a message.
_Avoid_: Node (fine in canvas code, but not in domain language), block

**Link**:
A directed connection that carries messages from one Step to another.
_Avoid_: Arrow, edge, wire, connection (Connection is a separate thing: reusable endpoint configuration)

**Link end**:
One side of a Link as seen from a Step: outbound on the sending Step, inbound on the receiving Step.
_Avoid_: Port, bound

**Branch**:
One outbound Link of a Router, together with every Step downstream of it. Every Branch ends in a Sink.

**Default branch**:
The Branch a Router uses when no other Branch applies, or to carry on after its other Branches are done. A Recipient list Router has none.
_Avoid_: Otherwise, else

**Condition**:
An expression, with its language, on a Router's outbound Link that decides whether a message takes that Branch.
_Avoid_: Rule (in DIL, `rule` is the Branch's name, not its condition), when-clause

## Step types

**Source**:
A Step where messages enter the Flow. It has no inbound Link and one outbound Link. Every Flow has exactly one.

**Action**:
A Step that processes a message on its way through. It has one inbound Link and one outbound Link.

**Router**:
A Step that sends each message to one or more of its Branches. It has one inbound Link.

**Fixed-slot Router**:
A Router whose Branches are set by its kind, for example if, split, enrich or wiretap: one named Branch plus the Default branch.

**List Router**:
A Router with any number of equal Branches that the user adds, for example recipient or content.

**Sink**:
A Step where messages leave the Flow. It has one inbound Link and no outbound Link.

**Error Step**:
The Flow-level error handler. It is part of the Flow's settings, not a node joined by Links.
_Avoid_: Error node

## APIs

**API**:
A REST interface that Assimbly serves, made up of Operations under one base path, with a name and a version label. It is designed in Assimbly, and its OpenAPI document is produced from it. An imported OpenAPI document becomes an API once, and from then on the API is what gets edited.
_Avoid_: Service, REST route

**Operation**:
One HTTP method on one path template within an API, for example `GET /customers/{id}`, together with its parameters and request and response schemas. Every Operation is handled by exactly one Handler Flow. No two Operations anywhere share the same method and full path.
_Avoid_: Endpoint (that is a Step's `component:path?options`), Route, Resource

**Declared response**:
One answer an Operation promises in its contract: a status code with a description and, optionally, a media type and schema. It describes what a caller can expect; the Response Sink is what actually answers.
_Avoid_: Response (that is the Sink)

**Handler Flow**:
The Flow that handles one Operation. Its Source is that Operation, so a request to the Operation is a message entering the Flow. Calling an existing Flow or a database from an Operation is done with Steps in its Handler Flow. Only a Visual or Script Flow can be a Handler Flow, and it lives and dies with its Operation.
_Avoid_: Operation flow, API flow

**Response**:
A Sink that ends a request to an Operation and gives the caller its status code, headers and body. In a Handler Flow, every Branch that ends the request ends in a Response. A failure no Step handles answers the caller with `500` instead.
_Avoid_: Reply (fine in code), return

**API status**:
A summary of the Flow statuses of an API's Handler Flows, such as "3 of 4 Operations running". An API has no status of its own: starting or stopping it starts or stops its Handler Flows.

**Call Flow**:
A Step that sends the message to another Flow. As an Action it waits for that Flow's answer and carries on with it; as a Sink it hands the message over and the Flow ends there.
_Avoid_: Flow link (it isn't a Link), subflow

## Endpoints

**Endpoint**:
What a Step talks to, written as a Component, a path and Options (`component:path?options`). Every Endpoint is edited the same way, whatever its Component.
_Avoid_: URI (fine in code), Connection (reusable settings an Endpoint can use)

**Component**:
The kind of system an Endpoint talks to, such as File, SFTP, HTTP or Kafka. Components come from Apache Camel, and every Component it offers is available.
_Avoid_: Connector, scheme

**Option**:
One key–value setting on an Endpoint, such as `delay` = `5000`.
_Avoid_: Parameter, property

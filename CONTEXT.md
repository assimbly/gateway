# Assimbly Gateway

The Gateway is where users design, configure and run integration Flows. This glossary covers the vocabulary of designing a Flow.

## Flows

**Flow**:
A unit of integration logic: a tree of Steps joined by Links, starting at exactly one Source, with Flow-level settings such as error handling. Branches never merge and never loop back.
_Avoid_: Route (a Route is a separate thing: a hand-written Camel route a Step can refer to)

**Draft**:
A Flow that has been saved but is not yet complete enough to run: a Step still needs its configuration, or a Branch doesn't end in a Sink yet.

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

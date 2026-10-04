# A Flow is a tree

A Flow designed on the canvas is a tree. It starts at exactly one Source, it only branches at Routers, its Branches never merge or loop back, and every Branch ends in its own Sink. So every Step has at most one inbound Link. We first wanted NiFi-style freedom, with joins and loops. We chose the tree because it is the only shape the DIL runtime executes: each Router fans out into Camel routes, and a Branch's result returns to its Router (enrich, split, loop) instead of rejoining the Flow somewhere else. All 159 existing example Flows already follow this shape.

## Consequences

- The canvas enforces this after every edit. A Draft can be incomplete in its Step configuration, and it can be unfinished at its ends: a Source or Action without a next Step yet. It never has a join, a loop or a dangling Link, and it stays a Draft until every Branch ends in a Sink.
- Deleting a Step or Branch removes, or reconnects, whatever the tree requires. The user never fixes up dangling Links by hand.
- Allowing joins or loops later would mean changing the canvas rules, the deletion rules, the DIL export and the runtime transpiler together.

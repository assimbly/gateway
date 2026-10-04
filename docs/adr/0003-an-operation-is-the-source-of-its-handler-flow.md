# An Operation is the Source of its Handler Flow

Every Operation of an API is handled by exactly one Handler Flow, and that Flow's Source is the Operation itself. We considered letting an Operation point at any existing Flow, so several Operations could share one Flow. We rejected it because an existing Flow already has its own Source (a file poller, a queue), and calling it from an Operation would skip that Source, so the same Flow would mean different things depending on how it was reached. We also rejected giving Operations their own small step chain in the API builder, because that would be a second canvas with a second tree model next to ADR 0001. With this choice, an API is a grouping and contract layer over ordinary Flows. It needs no runtime changes, because the DIL runtime already serves one REST operation per Flow through its `rest` Source.

## Consequences

- "Call an existing Flow" is done inside the Handler Flow: Operation → Call Flow → Response. So Call Flow must also work as an Action (InOut), not only as a Sink.
- A Handler Flow is Visual or Script. A Route Flow can't be one, because its hand-written route brings its own `from`.
- A Handler Flow's Source is locked on the canvas and edited from the API. A Handler Flow is deleted by deleting its Operation, and cloning one gives an ordinary Flow with a placeholder Source.
- An API has no status of its own. Its status is a summary of its Handler Flows' statuses, and starting or stopping the API starts or stops them.
- Letting many Operations share one Flow later would mean a new kind of Source that knows which Operation a request came through.

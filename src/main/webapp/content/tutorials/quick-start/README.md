# Quick start

<!-- tutorial: {"id":"quick-start","wiki":"quick-start","title":"Quick start","minutes":5,"track":"Get started","fixtures":{"ExampleFlow":"ExampleFlow.xml"}} -->

Run your first Flow in 5 minutes.

<!-- web-only -->
> The Gateway isn't running yet? [Install and start it](https://github.com/assimbly/gateway/wiki/quick-start) first. You can also follow this quick start inside the Gateway: click **Tutorials** in the menu.

## Open ExampleFlow

<!-- step: {"check":"route:/flow/editor"} -->

Go to **Flows → Manage** and click *ExampleFlow*. <!-- show: tr[data-flow-name="ExampleFlow"] td a -->

It has two Steps:

* a **Source** that sends one message when the Flow starts <!-- show: .flow-step-source -->
* a **Sink** that writes it to the log <!-- show: .flow-step-sink -->

<!-- web-only -->
> No *ExampleFlow*? Import [ExampleFlow.xml](https://github.com/assimbly/documentation/blob/master/tutorials/v6/quick-start/ExampleFlow.xml) with **Import** on **Flows → Manage**.

## Start it

<!-- step: {"check":"flowStatus:ExampleFlow:started"} -->

Click **Test** at the top. <!-- show: [data-cy="mode-toggle"] --> In **Test** you run the Flow and see what it does.

Click **▶** (Start). <!-- show: [data-tour="flow-status-controls"] -->

A **1** appears on both Steps: the message went through.

## See the message

<!-- step: {"check":"flowLog:ExampleFlow:Example flow running"} -->

Click the **Log** tab. <!-- show: [data-cy="test-view-log"] -->

You see `Example flow running`.

## Stop it

<!-- step: {"check":"flowStatus:ExampleFlow:stopped"} -->

Click **■** (Stop). <!-- show: [data-tour="flow-status-controls"] -->

**Done!** Next, build your own Flow in [Tutorial 1](https://github.com/assimbly/gateway/wiki/tutorial6-your-first-flow).

# Quick start

<!-- tutorial: {"id":"quick-start","wiki":"quick-start","title":"Quick start","minutes":5,"fixtures":{"ExampleFlow":"ExampleFlow.xml"}} -->

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

Click **Start**. <!-- show: [data-tour="flow-start"] -->

**Completed** goes to 1: the message went through. <!-- show: [data-tour="flow-completed"] -->

## See the message

<!-- step: {"check":"flowLog:ExampleFlow:Example flow running"} -->

Click **Log**. <!-- show: [data-tour="flow-log"] -->

You see `Example flow running`.

## Stop it

<!-- step: {"check":"flowStatus:ExampleFlow:stopped"} -->

Close the log and click **Stop**. <!-- show: [data-tour="flow-stop"] -->

**Done!** Next, build your own Flow in [Tutorial 1](https://github.com/assimbly/gateway/wiki/tutorial6-debugging-a-flow).

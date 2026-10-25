# Quick start

<!-- tutorial: {"id":"quick-start","wiki":"quick-start","title":"Quick start","minutes":5,"track":"Get started","fixtures":{"ExampleFlow":"ExampleFlow.xml"}} -->

Run your first Flow in 5 minutes — no coding required.

<!-- web-only -->
> **Haven't started Assimbly yet?**
> 1. Download the bundle for **Windows** (`.zip`) or **Mac** (`.tar.gz`) from the [latest release](https://github.com/assimbly/gateway/releases/latest) and unpack it.
> 2. Double-click **`Assimbly`** (`Start Assimbly.bat` on Windows, `Start Assimbly.command` on Mac). A terminal window opens, and after ~10 seconds your browser opens **[http://localhost:8080](http://localhost:8080)** automatically.
> 3. Sign in with `admin` / `admin` and choose your own password.
> 4. Click **Tutorials → Quick start** in the top menu to follow these steps interactively right inside Assimbly!
>
> *(Need help with Windows/Mac security prompts, Docker, or Java? See the [Install guide](https://github.com/assimbly/gateway/wiki/install).)*

## Open ExampleFlow

<!-- step: {"check":"route:/flow/editor"} -->

Every new Assimbly Gateway comes with a ready-made Flow called *ExampleFlow*.

1. Go to **Flows → Manage** and click *ExampleFlow*. <!-- show: tr[data-flow-name="ExampleFlow"] td a -->

You now see the visual Flow canvas with two connected Steps:

* a **Source** (left) that creates one message (`Example flow running`) when the Flow starts <!-- show: .flow-step-source -->
* a **Sink** (right) that writes that message to the log <!-- show: .flow-step-sink -->

<!-- web-only -->
> Don't see *ExampleFlow*? Click **Import** on **Flows → Manage** and select [ExampleFlow.xml](https://github.com/assimbly/documentation/blob/master/tutorials/v6/quick-start/ExampleFlow.xml).

## Start it

<!-- step: {"check":"flowStatus:ExampleFlow:started"} -->

1. Click **Test** at the top of the editor. <!-- show: [data-cy="mode-toggle"] -->
2. Click **▶** (Start). <!-- show: [data-tour="flow-status-controls"] -->

Within a second, a **1** appears on both Steps — your message was created and sent through the Flow!

> **Design vs. Test:** **Design** is where you build and change a Flow. **Test** is where you run it and watch messages move through each Step live.

## See the message

<!-- step: {"check":"flowLog:ExampleFlow:Example flow running"} -->

1. Click the **Log** tab at the bottom. <!-- show: [data-cy="test-view-log"] -->

You see the log entry with your message: `Example flow running`.

## Stop it

<!-- step: {"check":"flowStatus:ExampleFlow:stopped"} -->

1. Click **■** (Stop). <!-- show: [data-tour="flow-status-controls"] -->

**Congratulations — you just ran your first Assimbly Flow!** Next, build your own Flow from scratch in [Tutorial 1](https://github.com/assimbly/gateway/wiki/tutorial6-your-first-flow).

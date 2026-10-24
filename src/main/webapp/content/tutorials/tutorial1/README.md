# Tutorial 1: Your first Flow

<!-- tutorial: {"id":"tutorial1","wiki":"tutorial6-your-first-flow","title":"Tutorial 1: Your first Flow","minutes":5,"track":"Get started"} -->

**What you'll learn**

* Build a Flow on the canvas
* Start it and send it a message
* See the message arrive

**File (Source)** → **File (Sink)**

It takes about 5 minutes.

<!-- web-only -->
> You can also follow this tutorial inside the Gateway: click **Tutorials** in the menu. It shows each step next to the screen it's about and ticks it off once you've done it.

## Before you start

* The Gateway running, and you signed in: see the [Quick start](https://github.com/assimbly/gateway/wiki/quick-start)

## Step 1: Create TestFlow

You build *TestFlow*: it picks up each file from an `in` folder and drops it in an `out` folder. The other tutorials start from this Flow too.

1. Go to **Flows → Manage** and click **Add**. <!-- show: [aria-label="Add"] -->
2. Choose **Visual** (marked *No code · recommended*). <!-- show: a.flow-type-choice -->
3. Next to **Flow name** at the top, type `TestFlow`. <!-- show: #field_flowName -->

The canvas shows a new Flow of two Steps: a Source that receives messages and a Sink that delivers them. You configure them in the next step.

## Step 2: Configure the Source and the Sink

<!-- step: {"check":"flowStep:TestFlow:/out"} -->

1. Click the **Source** on the canvas. <!-- show: .flow-step-source --> A panel opens on the right where you configure it. (Don't see the panel? Click **Show panel**.) <!-- show: [aria-controls="flow-designer-panel"] -->
   * **Component:** `File`
   * **Directory Name:** `@{messages}/in`, the `in` folder in your messages folder <!-- show: [formcontrolname="uri"] -->
2. Click the **Sink** on the canvas. <!-- show: .flow-step-sink --> A new Flow's Sink writes each message to the log. Change it so it writes files instead:
   * **Component:** `File`
   * **Directory Name:** `@{messages}/out`
3. Click **Save**. <!-- show: [data-tour="flow-save"] -->

The folders don't have to exist: the File component creates them when the Flow starts.

> **Your messages folder.** The tutorials keep their files in the folder `messages` in your home folder: `C:\Users\<you>\messages` on Windows, `/home/<you>/messages` on Linux, `/Users/<you>/messages` on macOS and `/data/messages` in Docker. A Flow refers to it as `@{messages}`, a **Variable** the Gateway creates for you, so the same Flow works on every machine. You find it under **Flows → Variables**.

## Step 3: Start it and test it

<!-- step: {"check":"flowCompleted:TestFlow"} -->

1. Click **Save & Test** at the top right of the editor. <!-- show: [data-tour="flow-save-test"] --> It saves the Flow, starts it and switches the editor from **Design** to **Test**. The *Test* panel opens on the right.
2. Under **Body**, type `Hello Assimbly`, <!-- show: .flow-test .body-codemirror --> then click **Run**. <!-- show: [data-cy="test-run"] -->

**Run** hands your message to the Step after the Source, here the Sink. The panel shows **Passed**, and the Sink drops the message as a file in the `out` folder: `@{messages}/out`, for example `C:\Users\<you>\messages\out` on Windows. Open it to see your message. On the canvas, the Sink shows a **1**: it handled one message.

> **And the Source?** It picks up every file in the `in` folder. Drop a file there yourself and it ends up in `out` too. Camel's File component moves the files it has picked up to a hidden `.camel` subfolder of the `in` folder, so the same file is not processed twice.

**Good to know**

* Click **Design** at the top to change the Flow again, and **Test** to run it. <!-- show: [data-cy="mode-toggle"] --> While the Flow runs, **Save & Test** saves it and restarts it, so your change takes effect.
* A Flow that isn't complete yet, for example a Source without a Sink, is saved as a **Draft**. It shows a *Draft* badge in the header and can't be started until it's finished. Hover over the badge to see what is missing.
* Errors are handled by the Flow's **Error handler**. For a new Flow it writes the error to the Gateway log. You can change it from the toolbar of the editor.
* Every Flow runs as an [Apache Camel](https://camel.apache.org/) route. In **Test**, the **Camel route** tab shows the route of the running Flow, ready to copy or download. <!-- show: [data-cy="test-view-route"] -->

**Done!** You built your first Flow. Leave *TestFlow* running and continue with [Tutorial 2: Debugging a Flow](https://github.com/assimbly/gateway/wiki/tutorial6-debugging-a-flow), where you break a copy of it on purpose.

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

You build *TestFlow*. It moves files from an `in` folder to an `out` folder.

1. Go to **Flows → Manage** and click **Add**. <!-- show: [aria-label="Add"] -->
2. Choose **Visual**. <!-- show: a.flow-type-choice -->
3. Next to **Flow name**, type `TestFlow`. <!-- show: #field_flowName -->

The canvas shows two Steps: a **Source** and a **Sink**.

> **Why a Source and a Sink?** The Source receives messages and the Sink delivers them. Every Flow has at least these two. You configure them in the next step.

> **Why TestFlow?** The other tutorials start from this Flow too, so keep it.

## Step 2: Configure the Source and the Sink

<!-- step: {"check":"flowStep:TestFlow:/out"} -->

1. Click the **Source** on the canvas. <!-- show: .flow-step-source --> Set:
   * **Component:** `File`
   * **Directory Name:** `@{messages}/in` <!-- show: [formcontrolname="uri"] -->
2. Click the **Sink** on the canvas. <!-- show: .flow-step-sink --> Set:
   * **Component:** `File`
   * **Directory Name:** `@{messages}/out`
3. Click **Save**. <!-- show: [data-tour="flow-save"] -->

> **Tip: no settings on the right?** Click **Show panel**. <!-- show: [aria-controls="flow-designer-panel"] -->

> **What is `@{messages}`?** A **Variable** that points to the folder `messages` in your home folder, such as `C:\Users\<you>\messages` on Windows, `/home/<you>/messages` on Linux, `/Users/<you>/messages` on macOS and `/data/messages` in Docker. That way the same Flow works on every machine. You find it under **Flows → Variables**.

> **Do the folders have to exist?** No. The File component creates them when the Flow starts.

> **Why change the Sink?** A new Flow's Sink writes each message to the log. Now it writes files instead.

## Step 3: Start it and test it

<!-- step: {"check":"flowCompleted:TestFlow"} -->

1. Click **Save & Test** at the top right. <!-- show: [data-tour="flow-save-test"] --> The editor switches to **Test**.
2. Under **Body**, type `Hello Assimbly`. <!-- show: .flow-test .body-codemirror -->
3. Click **Run**. <!-- show: [data-cy="test-run"] -->

The panel shows **Passed** and the Sink on the canvas shows a **1**. Your message is now a file in `@{messages}/out`. Open it to have a look.

> **What does Save & Test do?** It saves the Flow, starts it and switches the editor from **Design** to **Test**. When the Flow already runs, it restarts it, so your change takes effect.

> **Why does only the Sink count the message?** **Run** hands your message to the Step after the Source. The Source itself picks up every file in the `in` folder: drop a file there and it ends up in `out` too. Files it picked up move to a hidden `.camel` folder, so they're not processed twice.

> **Good to know**
>
> * **Design** and **Test** at the top switch between building the Flow and running it. <!-- show: [data-cy="mode-toggle"] -->
> * A Flow that isn't finished, such as a Source without a Sink, is saved as a **Draft**. Hover over its *Draft* badge to see what's missing.
> * The **Error handler** in the toolbar decides what happens with errors. For a new Flow it writes them to the Gateway log.
> * Every Flow runs as an [Apache Camel](https://camel.apache.org/) route. **Camel route** in **Test** shows it. <!-- show: [data-cy="test-view-route"] -->

**Done!** You built your first Flow. Leave *TestFlow* running and continue with [Tutorial 2: Debugging a Flow](https://github.com/assimbly/gateway/wiki/tutorial6-debugging-a-flow).

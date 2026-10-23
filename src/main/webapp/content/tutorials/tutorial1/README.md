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
4. Click the **Source** on the canvas. <!-- show: .flow-step-source --> A panel opens on the right where you configure it. (Don't see the panel? Click **Show editor**.) <!-- show: [aria-controls="flow-designer-panel"] -->
   * **Component:** `File`
   * **Directory Name:** `@{messages}/in`, the `in` folder in your messages folder <!-- show: [formcontrolname="uri"] -->
5. Click the **Sink** on the canvas. <!-- show: .flow-step-sink --> A new Flow's Sink writes each message to the log. Change it so it writes files instead:
   * **Component:** `File`
   * **Directory Name:** `@{messages}/out`

The folders don't have to exist: the File component creates them when the Flow starts.

> **Your messages folder.** The tutorials keep their files in the folder `messages` in your home folder: `C:\Users\<you>\messages` on Windows, `/home/<you>/messages` on Linux, `/Users/<you>/messages` on macOS and `/data/messages` in Docker. A Flow refers to it as `@{messages}`, a **Variable** the Gateway creates for you, so the same Flow works on every machine. You find it under **Flows → Variables**.

You now have a Flow of two Steps: a Source that receives messages and a Sink that delivers them. There's no need to save in between: you save the Flow in the next step, right before you start it.

## Step 2: Save it, start it and send a message

<!-- step: {"check":"flowCompleted:TestFlow"} -->

1. Click **Save**. <!-- show: [data-tour="flow-save"] -->
2. Click **Start** at the top right of the editor. <!-- show: [data-tour="flow-start"] --> The button turns green once the Flow is running. (Next time, **Save & start** does both in one click.) <!-- show: [data-tour="flow-save-start"] -->
3. Click **Send test message**. <!-- show: [data-tour="flow-send-test"] --> The Send page opens with the Source of *TestFlow* as destination: `file://@{messages}/in`.
4. Under **Body**, type `Hello Assimbly`, <!-- show: .body-codemirror --> then click **Send**. <!-- show: [title="Send (Ctrl+Enter)"] -->

The Gateway writes your message as a file in the `in` folder. Within a second the Source picks it up and the Sink drops it in the `out` folder: `@{messages}/out`, for example `C:\Users\<you>\messages\out` on Windows. Open it to see your message.

5. Click **Back**. In the editor header, the **Completed** counter went up by one. <!-- show: [data-tour="flow-completed"] -->

> You can also drop any file in the `in` folder yourself. Camel's File component moves the files it has picked up to a hidden `.camel` subfolder of the `in` folder, so the same file is not processed twice.

**Good to know**

* A Flow that isn't complete yet, for example a Source without a Sink, is saved as a **Draft**. It shows a *Draft* badge in the header and can't be started until it's finished. Hover over the badge to see what is missing.
* Errors are handled by the Flow's **Error handler**. For a new Flow it writes the error to the Gateway log. You can change it from the toolbar of the editor.
* Every Flow runs as an [Apache Camel](https://camel.apache.org/) route. Click **Camel route** in the editor header to see the route of a running Flow, and to copy or download it. <!-- show: [data-tour="flow-camel-route"] -->

**Done!** You built your first Flow. Leave *TestFlow* running and continue with [Tutorial 2: Debugging a Flow](https://github.com/assimbly/gateway/wiki/tutorial6-debugging-a-flow), where you break a copy of it on purpose.

# Tutorial 2: Debugging a Flow

<!-- tutorial: {"id":"tutorial2","wiki":"tutorial6-debugging-a-flow","title":"Tutorial 2: Debugging a Flow","minutes":8,"track":"Get started","fixtures":{"TestFlow":"TestFlow.xml"}} -->

**What you'll learn**

* Find out why a Flow doesn't start
* Spot failed messages: the Test panel, stats and alerts

It takes about 8 minutes.

<!-- web-only -->
> You can also follow this tutorial inside the Gateway: click **Tutorials** in the menu. It shows each step next to the screen it's about and ticks it off once you've done it.

## Before you start

* *TestFlow* from [Tutorial 1](https://github.com/assimbly/gateway/wiki/tutorial6-your-first-flow). No *TestFlow*? Click **Add TestFlow** in the Tutorials panel, or import [TestFlow.xml](https://github.com/assimbly/documentation/blob/master/tutorials/v6/tutorial2/TestFlow.xml) on **Flows → Manage**.
* No `out2` folder in your messages folder

## Step 1: Clone the TestFlow

<!-- step: {"check":"route:mode=clone"} -->

You make a copy of *TestFlow* that can't deliver its files, and find out what goes wrong.

1. Go to **Flows → Manage**. If *TestFlow* isn't running, click **▶** in its row: you need it running in step 3.
2. In the row of *TestFlow*, click **⋮** (*More actions*) <!-- show: tr[data-flow-name="TestFlow"] [aria-label="More actions"] --> and choose **Clone**.

![Clone the TestFlow](01-clone-flow.png)

The editor opens with a copy of *TestFlow*. Everything is copied except the name, which is empty.

## Step 2: Make the Sink fail

Change the copy so it can't deliver its files:

1. Next to **Flow name**, type `DebugFlow`. <!-- show: #field_flowName -->
2. Click the **Sink** on the canvas. <!-- show: .flow-step-sink --> Its settings open in the panel on the right. (Don't see the panel? Click **Show panel**.)
3. Change **Directory Name** to `@{messages}/out2`. <!-- show: [formcontrolname="uri"] -->
4. Under **Options**, choose **Auto Create** in the list and turn the switch **Off**. <!-- show: .option-row -->

![Configure the Sink](02-configure-sink.png)

Normally the File component creates a missing folder for you. With **Auto Create** off it can't, so every file this Flow tries to deliver fails.

## Step 3: Find out why a Flow doesn't start

<!-- step: {"check":"flowExists:DebugFlow"} -->

Errors can also happen when a Flow starts. *TestFlow* is still running, so you run into one right away:

1. Click **Save & Test**. <!-- show: [data-tour="flow-save-test"] --> It saves the Flow, switches to **Test** and tries to start it.

*DebugFlow* doesn't start. Instead a red **Error** badge appears in the header. Click it to see why: <!-- show: [data-tour="flow-error-badge"] --> the *Alerts* panel opens with a **Failed to start** alert.

![Error on start](06-start-error.png)

Every alert shows the same fields: when it happened, the **Endpoint** of the Step that failed, the **Error** itself (click **Copy** to paste it somewhere else) and, for common errors, **What it means**. Here both Flows read from the same folder, `@{messages}/in`. Only one Source at a time may listen to the same file endpoint, so the second Flow can't start: `Multiple consumers for the same endpoint is not allowed`.

The alert stays until you clear it, also after you reload the page.

## Step 4: Send a message and watch it fail

<!-- step: {"check":"flowFailed:DebugFlow"} -->

1. Stop *TestFlow*, so *DebugFlow* can listen to the `in` folder: go to **Flows → Manage** and click **■** in its row. <!-- show: tr[data-flow-name="TestFlow"] [aria-label="Stop"] -->
2. Click *DebugFlow* to open it. If it opens in **Design**, click **Test**. <!-- show: [data-cy="mode-toggle"] -->
3. Click **Start**. <!-- show: [data-tour="flow-status-controls"] --> This time the Flow starts, and the red badge turns into a yellow **Alerts** badge.
4. In the *Test* panel, type `Hello Assimbly` under **Body** <!-- show: .flow-test .body-codemirror --> and click **Run**. <!-- show: [data-cy="test-run"] -->

The Sink can't store the message. The *Test* panel shows **Failed**, the Sink turns red on the canvas, and below it you find the error, with what it means: *The Gateway can't write the file there*. The **Alerts** badge counts one more alert, and the **Stats** tab <!-- show: [data-cy="panel-stats"] --> counts the message under **Failed**:

![The Flow fails](03-flow-failed.png)

5. Click the **Alerts** badge. <!-- show: [data-tour="flow-alert-badge"] --> The *Alerts* panel lists the errors of this Flow, newest first: the **Failed message** on top, the **Failed to start** from Step 3 below it:

![Alert details](04-alert-details.png)

`Cannot store file: ...messages\out2\...` tells you exactly what went wrong: the Sink can't write to the `out2` folder. Click **Clear** to remove the alerts, for everyone, once you've read them.

> **Where did my message go?** The Flow's **Error handler** takes care of failed messages. By default it writes the error to the Gateway log. To do something else with failed messages, click **Design**, then **Error handler** in the editor toolbar.

To fix the Flow, you would create the `out2` folder or turn **Auto Create** back on.

When you're done, click **Stop**. <!-- show: [data-tour="flow-status-controls"] -->

## Summary

| Where | What it tells you |
|-------|-------------------|
| **Error** badge | The Flow or one of its Steps didn't start. Click it to see why. |
| **Test** panel | Runs a message through the running Flow and shows the error of the Step that failed. |
| **Stats** tab | How many messages went through the Flow, and how many failed. |
| **Alerts** badge | The errors of this Flow, newest first: why it didn't start and which messages failed. They stay until you clear them. |

**Done!** You can find out why a Flow fails. Continue with [Tutorial 3: Calling a REST API](https://github.com/assimbly/gateway/wiki/tutorial6-calling-a-rest-api).

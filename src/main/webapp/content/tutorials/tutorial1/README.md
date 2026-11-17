# Tutorial 1: Your first Flow

<!-- tutorial: {"id":"tutorial1","wiki":"tutorial6-your-first-flow","title":"Tutorial 1: Your first Flow","minutes":5,"track":"Get started"} -->

**What you'll learn**

- Build a Flow on the canvas
- Start it and send it a message
- See the message arrive

**File (Source)** → **File (Sink)**

It takes about 5 minutes.

<!-- web-only -->

> You can also follow this tutorial inside the Gateway: click **Tutorials** in the menu. It shows each step next to the screen it's about and ticks it off once you've done it.

## Before you start

- The Gateway running, and you signed in: see the [Quick start](https://github.com/assimbly/gateway/wiki/quick-start)

## Step 1: Create TestFlow

You build _TestFlow_. It moves files from an `in` folder to an `out` folder.

1. Go to **Flows → Manage** and click **Add**. <!-- show: [aria-label="Add"] @ / -->
2. Choose **Visual**. <!-- show: a.flow-type-choice -->
3. At the top left, where it says _Flow name_, type `TestFlow`. <!-- show: #field_flowName -->

The canvas shows two Steps: a **Source** and a **Sink**.

> **Why a Source and a Sink?** The Source receives messages and the Sink delivers them. Every Flow has at least these two.

## Step 2: Configure the Source and the Sink

1. Click the **Source** on the canvas. <!-- show: .flow-step-source --> Set:
   - **Component:** `File`
   - **Directory Name:** `@{messages}/in` <!-- show: [formcontrolname="uri"] -->
2. Click the **Sink** on the canvas. <!-- show: .flow-step-sink --> Set:
   - **Component:** `File`
   - **Directory Name:** `@{messages}/out`

> **What is `@{messages}`?** A **Variable** that points to the folder `messages` in your home folder (see **Flows → Variables**). The File component creates the folders when the Flow starts.

## Step 3: Start it and test it

<!-- step: {"check":"flowCompleted:TestFlow"} -->

1. Click **Test** at the top of the editor. <!-- show: [data-cy="mode-toggle"] @ flow:TestFlow --> The Flow is saved automatically and the **Test** panel opens beside the Visual flow. <!-- show: [data-cy="test-tester"] @ flow:TestFlow:test -->
2. Click **▶** (Start) in the **Test** panel. <!-- show: [data-tour="flow-status-controls"] @ flow:TestFlow:test -->
3. Under **In**, type `Hello, Assimbly!` in **Body**. <!-- show: [data-cy="test-in"] @ flow:TestFlow:test -->
4. Click **Test**. <!-- show: [data-cy="test-run"] @ flow:TestFlow:test -->

The Tester shows **Passed** under **Out**, and the Sink on the canvas shows a **1**. Click the Sink <!-- show: .flow-step-sink @ flow:TestFlow:test --> to see its **In** and **Out** in the Tester. Your message is now a file in `@{messages}/out`. Open it to have a look.

**Done!** You built your first Flow. Leave _TestFlow_ running and continue with [Tutorial 2: Debugging a Flow](https://github.com/assimbly/gateway/wiki/tutorial6-debugging-a-flow).

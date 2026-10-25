# Tutorial 6: Message Queueing

<!-- tutorial: {"id":"tutorial6","wiki":"tutorial6-message-queueing","title":"Tutorial 6: Message Queueing","minutes":15,"track":"Messaging","fixtures":{"TestFlow":"TestFlow.xml"}} -->

**What you'll learn**

* Put messages on a queue from a Flow
* Take them off with another Flow
* See messages wait while the receiver is stopped

**FileToQueue:** **File** → **Simple JMS**, onto *OrdersQueue*

**QueueToFile:** **Simple JMS** → **File**, off *OrdersQueue*

It takes about 15 minutes.

<!-- web-only -->
> You can also follow this tutorial inside the Gateway: click **Tutorials** in the menu. It shows each step next to the screen it's about and ticks it off once you've done it.

## Before you start

* *TestFlow* from [Tutorial 1](https://github.com/assimbly/gateway/wiki/tutorial6-your-first-flow). No *TestFlow*? Click **Add TestFlow** in the Tutorials panel, or import [TestFlow.xml](https://github.com/assimbly/documentation/blob/master/tutorials/v6/tutorial6/TestFlow.xml) on **Flows → Manage**.
* A running broker, such as the *default* one: see [Tutorial 5](https://github.com/assimbly/gateway/wiki/tutorial6-create-a-new-broker)

## Step 1: Clone TestFlow

<!-- step: {"check":"route:mode=clone"} -->

You put a queue between two Flows. The first puts files on it, the second takes them off.

1. Go to **Flows → Manage**.
2. In the row of *TestFlow*, click **⋮** (*More actions*) and choose **Clone**. <!-- show: tr[data-flow-name="TestFlow"] [aria-label="More actions"] -->
3. Next to **Flow name**, type `FileToQueue`. <!-- show: #field_flowName -->
4. Click the **Source** on the canvas <!-- show: .flow-step-source --> and change **Directory Name** to `@{messages}/orders`. <!-- show: [formcontrolname="uri"] -->

> **Why another folder?** So *TestFlow* doesn't pick up the files of *FileToQueue*, even when it runs.

## Step 2: Put the files on a queue

1. Click the **Sink** on the canvas. <!-- show: .flow-step-sink -->
2. Click **Component**, type `sjms` and choose **Simple JMS**. <!-- show: [formcontrolname="componentType"] -->
3. Set **Destination Name** to `OrdersQueue`. <!-- show: [formcontrolname="uri"] -->
4. Check that **Connection** says *Gateway broker*. <!-- show: [formcontrolname="connection"] -->

> **Do I create the queue first?** No. The broker creates it the first time a Flow uses it.

> **What is the Connection for?** A JMS component needs to know which broker to talk to. The Gateway comes with a Connection to its built-in broker, *Gateway broker*, and picks it for you when it's the only one.

> **Tip: no Connection selected?** Choose one, or click **+** next to **Connection** <!-- show: [data-tour="step-new-connection"] --> and fill it in: **url** `tcp://localhost:61616`, **username** and **password** `admin`, **jmsprovider** `ActiveMQ Artemis` and **pooled** `true`.

## Step 3: Start it and send files

<!-- step: {"check":"queueMessages:OrdersQueue"} -->

1. Click **Save & Test**. <!-- show: [data-tour="flow-save-test"] -->
2. Under **Body**, type `Order 1` <!-- show: .flow-test .body-codemirror --> and click **Run**. <!-- show: [data-cy="test-run"] -->
3. Do the same with `Order 2` and `Order 3`, with **Run again**.

The Sink on the canvas shows **3**: three messages are on the queue.

> **Why does nobody take them off?** The Flow that does isn't there yet. You build it in step 5.

## Step 4: See the messages wait

<!-- step: {"check":"route:endpointName=OrdersQueue"} -->

1. Go to **Broker → Endpoints** and type `Orders` in the filter box.

*OrdersQueue* has 3 messages and 0 consumers: no one reads from it.

![Three messages wait on the queue](05-messages-waiting.png)

2. Click **OrdersQueue** to browse the messages. <!-- show: tr[data-endpoint-name="OrdersQueue"] td a -->

> **How long do they wait?** Until a Flow takes them off the queue.

## Step 5: Build the Flow that takes messages off the queue

1. Go to **Flows → Manage** and clone *TestFlow* once more. <!-- show: tr[data-flow-name="TestFlow"] [aria-label="More actions"] -->
2. Next to **Flow name**, type `QueueToFile`. <!-- show: #field_flowName -->
3. Click the **Source** on the canvas. <!-- show: .flow-step-source -->
4. Click **Component**, type `sjms` and choose **Simple JMS**. <!-- show: [formcontrolname="componentType"] -->
5. Set **Destination Name** to `OrdersQueue`. <!-- show: [formcontrolname="uri"] -->
6. Check that **Connection** says *Gateway broker*. <!-- show: [formcontrolname="connection"] -->

![The Source takes messages off OrdersQueue](03-source-queue.png)

> **And the Sink?** It's still the File component of *TestFlow*: it writes to `@{messages}/out`.

> **The same Connection again?** Yes. A Connection is set up once; after that, every Flow can use it.

## Step 6: Start it and watch the queue empty

<!-- step: {"check":"flowCompleted:QueueToFile"} -->

1. Click **Save & Test**. <!-- show: [data-tour="flow-save-test"] -->

The Steps on the canvas show **3**: *QueueToFile* took the waiting messages off the queue. `@{messages}/out` now has three files, one per order.

2. Go to **Broker → Endpoints**. *OrdersQueue* is empty and has 1 consumer: *QueueToFile*.

![The queue is empty](07-queue-empty.png)

3. When you're done, stop both Flows on **Flows → Manage**.

> **Why a queue?** The two Flows don't know about each other, only the queue. In real integrations the two sides are often different systems, such as a web shop and an ERP system. A queue between them:
>
> * **Buffers.** When the receiver is down or slow, messages wait instead of getting lost.
> * **Decouples.** You can stop, change or replace one Flow without touching the other.
> * **Spreads the load.** Several Flows can take messages off the same queue.

> **Try it yourself** Stop *QueueToFile*, send a few messages with **Run** in *FileToQueue*, and watch them wait on the queue until you start *QueueToFile* again.

## Summary

| What | Where | What it does |
|------|-------|--------------|
| **Simple JMS** Sink | *FileToQueue* | Puts every message on *OrdersQueue*. |
| **Simple JMS** Source | *QueueToFile* | Takes every message off *OrdersQueue*. |
| Connection *Gateway broker* | **Connection** field of a JMS Step | Tells the JMS component how to reach the broker. The Gateway comes with it; every Flow can use it. |
| *OrdersQueue* | **Broker → Endpoints** | Holds the messages until a Flow takes them off. |

**Done!** You built your first Flows with message queueing. Know Camel? Continue with [Tutorial 7: Create a simple route](https://github.com/assimbly/gateway/wiki/tutorial6-simple-route).

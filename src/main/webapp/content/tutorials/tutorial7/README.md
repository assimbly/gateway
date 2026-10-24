# Tutorial 7: Create a simple route

<!-- tutorial: {"id":"tutorial7","wiki":"tutorial6-simple-route","title":"Tutorial 7: Create a simple route","minutes":10,"track":"For Camel developers"} -->

**What you'll learn**

* Write a Camel route in XML
* Run it as a Flow
* Find its log message

It takes about 10 minutes.

<!-- web-only -->
> You can also follow this tutorial inside the Gateway: click **Tutorials** in the menu. It shows each step next to the screen it's about and ticks it off once you've done it.

## Before you start

* Camel knowledge helps, but isn't needed: the [Camel routes](https://camel.apache.org/manual/routes.html) page is a good start

## How it works

Under the hood, the Gateway runs every Flow as an [Apache Camel](https://camel.apache.org/) route. You can also write one yourself. The route in this tutorial moves files from one folder to another and logs what is in each file:

```xml
<route>
    <from uri="file:@{messages}/route"/>
    <log message="Received: ${body}"/>
    <to uri="file:@{messages}/out"/>
</route>
```

* `<from>` picks up files from the `route` folder, like a Source.
* `<log>` writes a line to the log, with the content of the message in place of `${body}`.
* `<to>` writes the file to the `out` folder, like a Sink.

`@{messages}` is the Variable for your messages folder (see **Flows → Variables**).

## Step 1: Create a Camel route Flow

<!-- step: {"check":"route:editor=route"} -->

1. Go to **Flows → Manage** and click **Add**. <!-- show: [aria-label="Add"] -->
2. Choose **Camel route** (marked *Low code*). <!-- show: a.flow-type-choice[href*="editor=route"] -->

![Add a Camel route Flow](01-add-flow.png)

The route editor opens. Instead of a canvas, it has a field to write the route in. It starts with a small example route, which sends `Hello world` once and logs it.

## Step 2: Write the route

<!-- step: {"check":"flowExists:SimpleRoute"} -->

1. Next to **Flow name**, type `SimpleRoute`. <!-- show: #field_flowName -->
2. Set **Route name** to `MoveFiles`. <!-- show: [formcontrolname="routeName"] -->
3. Replace the example in the **Camel route** field with this route: <!-- show: [data-tour="route-content"] -->

   ```xml
   <route>
       <from uri="file:@{messages}/route"/>
       <log message="Received: ${body}"/>
       <to uri="file:@{messages}/out"/>
   </route>
   ```

![The route](02-route.png)

4. Click **Save**. <!-- show: [data-tour="flow-save"] -->

> **Tips**
> * Click the **Edit** icon above the field to write the route in a larger editor.
> * With **Add route** you add more routes to the same Flow, for example routes that call each other. You do that in Tutorial 8.
> * On the **Error handler** tab you can write a route that handles errors. Leave it empty to use the default error handling.

## Step 3: Run the route and send it a message

<!-- step: {"check":"flowCompleted:SimpleRoute"} -->

1. Click **Save & Test**. <!-- show: [data-tour="flow-save-test"] --> It saves the Flow, starts it and switches from **Code** to **Test**. Your route is shown read-only, with the *Test* panel next to it.
2. Under **Body**, type `Hello Camel` <!-- show: .flow-test .body-codemirror --> and click **Run**. <!-- show: [data-cy="test-run"] -->

The message goes into your route right after its `<from>`. The route logs it and writes it to the `out` folder of your messages folder: `@{messages}/out`. The panel shows **Passed**.

![The route is running](03-route-running.png)

> **And the `<from>`?** It picks up every file in the `route` folder. Drop a file there yourself, and the route logs its content and moves it to `out` too.

## Step 4: Find the log message

<!-- step: {"check":"flowLog:SimpleRoute:Received"} -->

1. Click the **Log** tab. <!-- show: [data-cy="test-view-log"] -->
2. Type `Received` in the filter box. <!-- show: #flowLogSearchText -->

There it is: `Received: Hello Camel`, written by the `<log>` line of your route.

> **See it as Camel runs it.** Click the **Camel route** tab to see the route the runtime built, with `@{messages}` filled in. <!-- show: [data-cy="test-view-route"] --> It works for visual Flows too: open *TestFlow* in **Test** and click **Camel route** to see the Camel route behind the canvas, ready to copy or download.

When you're done, click **Stop**. <!-- show: [data-tour="flow-status-controls"] -->

## Visual Flow or Camel route?

| | Visual Flow | Camel route |
|---|---|---|
| **Build** | Click Steps together on a canvas | Write XML |
| **For** | Anyone who knows the systems they integrate | Camel engineers |
| **Strength** | Quick to build and easy to read | Everything Camel can do, such as splitting, filtering and routing on content |

You can mix them: some Flows visual, others as Camel routes, all running in the same Gateway.

**Done!** You wrote and ran your first Camel route. In the next tutorial you build a bigger route with queues and a split: [Tutorial 8: A route with queues and a split](https://github.com/assimbly/gateway/wiki/tutorial6-routes-with-split).

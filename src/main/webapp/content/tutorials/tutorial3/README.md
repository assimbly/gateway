# Tutorial 3: Calling a REST API

<!-- tutorial: {"id":"tutorial3","wiki":"tutorial6-calling-a-rest-api","title":"Tutorial 3: Calling a REST API","minutes":10,"track":"Connect systems","fixtures":{"TestFlow":"TestFlow.xml"}} -->

**What you'll learn**

* Start a Flow on a timer with a **Scheduler**
* Call a REST API with **HTTPS**
* Save the answer under a fixed file name

**Scheduler (Source)** → **HTTPS (Action)** → **File (Sink)**

It takes about 10 minutes.

<!-- web-only -->
> You can also follow this tutorial inside the Gateway: click **Tutorials** in the menu. It shows each step next to the screen it's about and ticks it off once you've done it.

## Before you start

* *TestFlow* from [Tutorial 1](https://github.com/assimbly/gateway/wiki/tutorial6-your-first-flow). No *TestFlow*? Click **Add TestFlow** in the Tutorials panel, or import [TestFlow.xml](https://github.com/assimbly/documentation/blob/master/tutorials/v6/tutorial3/TestFlow.xml) on **Flows → Manage**.
* Internet access: the Flow calls the free [Open-Meteo](https://open-meteo.com/) weather API (no account or key needed)

## Step 1: Clone TestFlow

<!-- step: {"check":"route:mode=clone"} -->

You build *Weather*: every 30 seconds it gets the weather in Amsterdam and saves it as a file.

1. Go to **Flows → Manage**.
2. In the row of *TestFlow*, click **⋮** (*More actions*) <!-- show: tr[data-flow-name="TestFlow"] [aria-label="More actions"] --> and choose **Clone**.
3. Next to **Flow name**, type `Weather`. <!-- show: #field_flowName -->

## Step 2: Use a Scheduler as Source

1. Click the **Source** on the canvas. <!-- show: .flow-step-source -->
2. Click **Component**, type `sched` and choose **Scheduler**. <!-- show: [formcontrolname="componentType"] -->
3. Set **Name** to `weather`. <!-- show: [formcontrolname="uri"] -->
4. Under **Options**, choose **Delay** and type `30000`. <!-- show: .option-row -->

![Configure the Scheduler](01-scheduler-source.png)

> **Why 30000?** The delay is in milliseconds, so the Flow runs every 30 seconds. The first run starts a second after the Flow starts.

> **What is the Name for?** It's just a name for the scheduler.

## Step 3: Call the REST API

1. Click the **+** on the line between the Source and the Sink. <!-- show: [aria-label="Insert a Step here"] -->
2. Type `http` in the search box and choose **HTTP**.
3. Set **Http Uri** to: <!-- show: [formcontrolname="uri"] -->

   ```
   https://api.open-meteo.com/v1/forecast?latitude=52.37&longitude=4.89&current=temperature_2m,wind_speed_10m
   ```

4. Under **Options**, choose **Http Method** and select **GET**. <!-- show: .option-row -->

![Configure the HTTPS Action](02-https-action.png)

> **What does this address ask for?** The current temperature and wind speed in the center of Amsterdam.

> **Why does the Step say HTTPS now?** When you click elsewhere, the Step takes `https://` off the address and switches to **HTTPS (Secure)**, the Component that matches it. An address that starts with `http://` keeps **HTTP**.

## Step 4: Give the saved file a fixed name

1. Click the **Sink** on the canvas. <!-- show: .flow-step-sink -->
2. Under **Options**, choose **File Name** and type `weather.json`. <!-- show: .option-row -->

![Configure the Sink](03-sink-file-name.png)

> **Why a fixed name?** Otherwise the Sink saves each answer as a new file with a generated name. Now you always know where to look.

## Step 5: Start the Flow and read the weather

<!-- step: {"check":"flowCompleted:Weather"} -->

1. Click **Save & Test**. <!-- show: [data-tour="flow-save-test"] -->

After a second each Step on the canvas shows a **1**. Every 30 seconds the numbers go up.

![The Flow is running](04-flow-running.png)

2. Open `weather.json` in `@{messages}/out`. It holds the current weather, for example:

   ```json
   {
     "current": {
       "time": "2026-10-15T13:00",
       "temperature_2m": 18.5,
       "wind_speed_10m": 18.7
     }
   }
   ```

3. When you're done, click **■** (Stop). <!-- show: [data-tour="flow-status-controls"] --> Otherwise the Flow keeps calling the API.

> **No file?** Click the **Alerts** badge in the editor header to see the error.

> **Where is `@{messages}/out`?** The `out` folder in your messages folder, such as `C:\Users\<you>\messages\out` on Windows. The Variable `messages` under **Flows → Variables** holds its path.

> **Try it yourself: the weather in your town** Click **Design**, <!-- show: [data-cy="mode-toggle"] --> change `latitude` and `longitude` in the **Http Uri**, and click **Save & Test** again. <!-- show: [data-tour="flow-save-test"] --> It restarts the Flow, so the change takes effect right away. **Save** alone keeps the running Flow on its old configuration.

## Summary

| Step | Component | What it does |
|------|-----------|--------------|
| Source | **Scheduler** | Starts the Flow every 30 seconds (**Delay** `30000`). |
| Action | **HTTPS** | Calls the REST API with a GET. The answer becomes the message. |
| Sink | **File** | Saves the answer as `weather.json` (**File Name**) in the `out` folder. |

**Done!** Next, turn things around and create a REST API yourself: [Tutorial 4: Creating a REST API](https://github.com/assimbly/gateway/wiki/tutorial6-creating-a-rest-api).

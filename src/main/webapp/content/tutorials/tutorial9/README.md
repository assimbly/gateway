# Tutorial 9: Running scripts

<!-- tutorial: {"id":"tutorial9","wiki":"tutorial6-running-scripts","title":"Tutorial 9: Running scripts","minutes":10,"track":"For Camel developers"} -->

Sometimes a few lines of code are quicker than a Flow of Steps. A **Script** Flow runs your own script: for example in Camel's Simple language, Groovy, JavaScript, Python, JSLT or XSLT. In this tutorial you build a small clock: every 10 seconds one script writes a greeting with the current time, and a second script saves it to a file.

**What you'll do:**

1. Create a Script Flow
2. Set the Source that triggers the scripts
3. Write a script in Simple
4. Add a script in Groovy
5. Start the Flow and read the result

It takes about 10 minutes.

<!-- web-only -->
> You can also follow this tutorial inside the Gateway: click **Tutorials** in the menu. It shows each step next to the screen it's about and ticks it off once you've done it.

## Before you start

* You need the Gateway running and to be signed in. The [Quick start](https://github.com/assimbly/gateway/wiki/quick-start) shows how.

## How it works

A Script Flow has four parts:

| Part | What it does |
|------|--------------|
| **Source** | Starts the Flow, like in a visual Flow. A new Script Flow starts with **Once**, which sends one message when the Flow starts. |
| **Script** | Runs your script. The result of the script becomes the message. Add more Scripts to run them one after another: each Script gets the message the one before it made. |
| **Sink** | Takes the result of the last script. By default it's **Log Data**, which writes each result to the log. |
| **Error handler** | Takes care of a message when a script fails. By default it writes the error to the Gateway log. |

The Flow you build looks like this:

**Scheduler (Source)** → **Simple (Script)** → **Groovy (Script)** → **Log Data (Sink)**

## Step 1: Create a Script Flow

<!-- step: {"check":"route:editor=script"} -->

1. Go to **Flows → Manage** and click **Add**. <!-- show: [aria-label="Add"] -->
2. Choose **Script** (marked *Code*). <!-- show: a.flow-type-choice[href*="editor=script"] -->

![Add a Script Flow](01-add-flow.png)

The script editor opens. Like the route editor of [Tutorial 7](https://github.com/assimbly/gateway/wiki/tutorial6-simple-route), it has a form instead of a canvas. It opens on the **Script** view, which shows only the scripts. The line next to it sums up the other parts: *Starts: hello, once when started · Result: Log viewer · Errors: logged*.

## Step 2: Set the Source

1. Next to **Flow name**, type `Clock`. <!-- show: #field_flowName -->
2. Click **Flow** (or the link after **Starts:**). <!-- show: [data-tour="script-flow-view"] --> Now you see all four parts, starting with the **Source**.
3. Under **Source**, click **Component**, type `sched` and choose **Scheduler**. <!-- show: [formcontrolname="componentType"] -->
4. Set **Name** to `clock`. This is just a name for the scheduler. <!-- show: [formcontrolname="uri"] -->
5. Under **Options**, choose **Delay** in the list and type `10000`. <!-- show: .option-row -->

![The Source](02-source.png)

The delay is in milliseconds, so the scripts run once every 10 seconds. You know the Scheduler from [Tutorial 3](https://github.com/assimbly/gateway/wiki/tutorial6-calling-a-rest-api).

## Step 3: Write a script in Simple

1. Under **Script**, set **Language** to **Simple**. (A new script starts in Groovy.)
2. Replace the example in the **Script** field with: <!-- show: [data-tour="script-content"] -->

   ```
   Hello from Assimbly! The time is ${date:now:HH:mm:ss}
   ```

3. Click **Try it**. <!-- show: [data-tour="script-try"] --> Under **Resulting body** you see what the script makes, without starting the Flow.

[Simple](https://camel.apache.org/components/latest/languages/simple-language.html) is Camel's own small expression language. The text is copied as it is, and every `${...}` is replaced: `${date:now:HH:mm:ss}` by the current time. The result, for example `Hello from Assimbly! The time is 14:05:10`, becomes the message.

## Step 4: Add a script in Groovy

<!-- step: {"check":"flowExists:Clock"} -->

1. Click **Add** next to the script and choose **Script**. A second **Script** appears. Its **Language** is already **Groovy**.
2. Type this in its **Script** field:

   ```groovy
   new File("@{messages}/out/clock.txt").text = body
   body
   ```

![The two scripts](03-scripts.png)

[Groovy](https://groovy-lang.org/) is a programming language for the Java platform. In a script, `body` is the message: the greeting the Simple script made. The first line writes it to the file `clock.txt` in the `out` folder of your messages folder: the Gateway puts in the Variable `@{messages}` before the script runs. The second line, `body`, is the result of the script, so the message stays the same.

3. Click **Save**. <!-- show: [data-tour="flow-save"] -->

> **Which language?** Use **Simple** to build text from the message and its headers, **Groovy**, **JavaScript** or **Python** when you need real code, **JSLT** to transform JSON and **XSLT** to transform XML.

## Step 5: Start the Flow and read the result

<!-- step: {"check":"flowCompleted:Clock"} -->

1. Click **Start**. <!-- show: [data-tour="flow-start"] -->

The first run starts a second after you start the Flow. After that, the **Completed** counter goes up every 10 seconds: <!-- show: [data-tour="flow-completed"] -->

![The Flow is running](04-flow-running.png)

2. Open `clock.txt` in `@{messages}/out`, the `out` folder of your messages folder: `C:\Users\<you>\messages\out` on Windows. (The Variable `messages` under **Flows → Variables** holds the path of your messages folder.)

   ```
   Hello from Assimbly! The time is 14:05:10
   ```

Open it again a little later: the time has changed.

3. Click **Log** in the editor header. <!-- show: [data-tour="flow-log"] --> The **Sink** wrote each greeting to the log of this Flow, after `Body:`.

**Try it yourself:**

* Add the date: change the Simple script to `Hello from Assimbly! It is ${date:now:yyyy-MM-dd HH:mm:ss}`. Click **Save & restart** to run it with the new script. <!-- show: [data-tour="flow-save-start"] -->
* Break the Groovy script on purpose, for example by writing to a folder that doesn't exist. The **Failed** counter goes up and an **Alert** badge appears. See [Tutorial 1](https://github.com/assimbly/gateway/wiki/tutorial6-debugging-a-flow) for finding the error.

When you're done, click **Stop**. <!-- show: [data-tour="flow-stop"] --> Otherwise the Flow keeps writing the file every 10 seconds.

## Summary

| Step | Language | What it does |
|------|----------|--------------|
| Source | **Scheduler** | Starts the Flow every 10 seconds (**Delay** `10000`). |
| Script | **Simple** | Makes the greeting with the current time. The result becomes the message. |
| Script | **Groovy** | Writes the message (`body`) to `clock.txt` and keeps it as the result. |
| Sink | **Log Data** | Writes each result to the log. |

**Done!** You ran your first scripts. In the last tutorial you control the Gateway without the browser: [Tutorial 10: Using the API](https://github.com/assimbly/gateway/wiki/tutorial6-using-the-api).

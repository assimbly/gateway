# Quick start

<!-- tutorial: {"id":"quick-start","title":"Quick start","minutes":10,"fixtures":{"ExampleFlow":"ExampleFlow.xml"}} -->

Welcome to Assimbly Gateway 6! In about 10 minutes you will have the Gateway running and see a first Flow at work.

**What you'll do:**

1. Start the Gateway
2. Sign in
3. Open *ExampleFlow*, the Flow every new Gateway comes with
4. Start it and find its message in the log

<!-- web-only -->
> You can also follow this guide inside the Gateway: click **Tutorials** in the menu. It shows each step next to the screen it's about and ticks it off once you've done it.

## Prerequisites

<!-- step: {"skip":true} -->

You need **Java 25** (or newer) and a [release of the Assimbly Gateway](https://github.com/assimbly/gateway/releases). Prefer containers? See [Run with Docker](#run-with-docker) instead.

Check your Java version:

```
java -version
```

The first line should say version `25` or higher, for example:

```
openjdk version "25" 2025-09-16 LTS
```

If it doesn't, install Java 25 from [Adoptium](https://adoptium.net/).

## 1. Start the Gateway

<!-- step: {"skip":true} -->

Open a terminal, go to the folder that contains the downloaded jar and start it:

```
java -jar gateway-[version].jar
```

Wait until the log says the application is running. Then open the Gateway in your browser:

**[http://localhost:8080](http://localhost:8080)**

Keep the terminal open: the Gateway stops when you close it (press `Ctrl+C` to stop it yourself).

> **Port already in use?** Pick another one: `java -Dserver.port=8888 -jar gateway-[version].jar`

### Run with Docker

```
docker run -p 8088:8088 -v assimbly-data:/data assimbly/gateway-full
```

The Gateway is then at **[http://localhost:8088](http://localhost:8088)**. The volume keeps your Flows when the container is replaced.

## 2. Sign in

<!-- step: {"skip":true} -->

Sign in with username `admin` and password `admin`.

Because everyone knows that password, the Gateway first asks you to choose your own: type `admin` as the current password, then your new one twice. Until you do, nothing else works.

After that you land on **Flows → Manage**.

> **Secure by default.** On its first start the Gateway generates its own keys for login tokens and for encrypting secrets, and keeps them in `.assimbly/security/secrets.properties` in your home folder (in `/data` with Docker). Keep that file with your database: without it, the stored secrets can't be read. Registration is off: an administrator adds users under **Administration → Users**.

## 3. Meet ExampleFlow

<!-- step: {"check":"flowExists:ExampleFlow"} -->

On its first start the Gateway created *ExampleFlow*, a small Flow to try things out. You find it on **Flows → Manage**. <!-- show: tr[data-flow-name="ExampleFlow"] -->

Each row shows a Flow with its status, the buttons to start and stop it, and how many messages it handled (**Completed**) or failed to handle (**Failed**).

> **No ExampleFlow?** The Gateway only creates it when it starts for the first time with an empty database. In the **Tutorials** panel, click **Add ExampleFlow**, or import [ExampleFlow.xml](https://github.com/assimbly/documentation/blob/master/tutorials/v6/quick-start/ExampleFlow.xml) with **Import** on **Flows → Manage**.

## 4. Open it

1. Click *ExampleFlow* in the list. <!-- show: tr[data-flow-name="ExampleFlow"] td a -->

The editor opens. The canvas shows the two Steps of the Flow:

* The **Source** is where messages enter the Flow. Its Component is **Once**: when the Flow starts, it sends one message with the text `Example flow running`. <!-- show: .flow-step-source -->
* The **Sink** is where messages leave the Flow. Its Component is **Log Data**: it writes each message it gets to the Gateway log. <!-- show: .flow-step-sink -->

2. Double-click a Step to see its settings in the panel on the right. (Or click **Show editor**.) <!-- show: [aria-controls="flow-designer-panel"] -->

| Term | Meaning |
|------|---------|
| **Flow** | A path that messages travel, from one Source to one or more Sinks. |
| **Step** | One block on the canvas: a Source, an Action, a Router or a Sink. |
| **Component** | The kind of system a Step talks to, such as File, SFTP, HTTP or Kafka. |

## 5. Start it

<!-- step: {"check":"flowStatus:ExampleFlow:started"} -->

1. Click **Start** at the top right of the editor. <!-- show: [data-tour="flow-start"] -->

The button turns green once the Flow is running. Right away the Source sends its message to the Sink, and the **Completed** counter in the header goes up by one. <!-- show: [data-tour="flow-completed"] -->

## 6. Find its message in the log

<!-- step: {"check":"flowLog:ExampleFlow:Example flow running"} -->

1. Click **Log** in the editor header. <!-- show: [data-tour="flow-log"] -->

A panel opens with what this Flow logged: that it was started, and the message the Sink wrote, `Example flow running`.

> You see the same lines in the terminal where you started the Gateway, and under **Administration → Log viewer**.

## 7. Stop it

<!-- step: {"check":"flowStatus:ExampleFlow:stopped"} -->

1. Close the log panel.
2. Click **Stop** at the top right of the editor. <!-- show: [data-tour="flow-stop"] -->

**Done!** You ran your first Flow. Go to **Flows → Manage** to see it in the list, where you can start, pause, stop, clone, export or delete it.

Next, build a Flow of your own in [Tutorial 1: Your first Flow and debugging it](https://github.com/assimbly/gateway/wiki/tutorial6-debugging-a-flow).

## Troubleshooting

<!-- step: {"skip":true} -->

| Problem | What to check |
|---------|---------------|
| `java -version` shows an older version | Install Java 25 and make sure it is the first Java on your `PATH`. |
| The page doesn't load | Check that the terminal is still running and that you use the right port (`8080` for the jar, `8088` for Docker). |
| There is no *ExampleFlow* | See *No ExampleFlow?* in [step 3](#3-meet-exampleflow). |
| The Flow shows *Error* after starting | Click the **Error** badge for the Step that failed to start and the reason. |

## Next steps

<!-- step: {"skip":true} -->

* Build a Flow that moves files and learn to debug it in [Tutorial 1](https://github.com/assimbly/gateway/wiki/tutorial6-debugging-a-flow).
* Start your next Flow from an example: **Add** offers *Folder to folder*, *Scheduled HTTP call* and *Route by content*.
* Send a test message to a Flow from **Flows → Send**.
* Design a REST API in **APIs**.
* Read the [user guide](https://github.com/assimbly/gateway/wiki/user-guide) or follow one of the [tutorials](https://github.com/assimbly/gateway/wiki/tutorials).
* Stuck? [Open an issue](https://github.com/assimbly/gateway/issues).

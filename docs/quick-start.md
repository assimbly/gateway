# Quick start

Welcome to Assimbly Gateway 6! In about 10 minutes you will have the Gateway running and your first Flow moving files from one folder to another.

**What you'll do:**

1. Start the Gateway
2. Sign in
3. Build a Flow on the visual canvas
4. Start it and watch a file go through

## Prerequisites

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

The Gateway is then at **[http://localhost:8088](http://localhost:8088)**. The volume keeps your Flows when the container is replaced. Because the Gateway then runs inside a container, it can only see folders you mount into it. To follow this guide with Docker, add `-v <your folder>/messages:/messages` to the command and use `/messages/in` and `/messages/out` as paths below.

## 2. Sign in

Sign in with username `admin` and password `admin`.

Because everyone knows that password, the Gateway first asks you to choose your own: type `admin` as the current password, then your new one twice. Until you do, nothing else works.

After that you land on **Flows → Manage**. It's empty, and invites you to create your first Flow.

> **Secure by default.** On its first start the Gateway generates its own keys for login tokens and for encrypting secrets, and keeps them in `.assimbly/security/secrets.properties` in your home folder (in `/data` with Docker). Keep that file with your database: without it, the stored secrets can't be read. Registration is off: an administrator adds users under **Administration → Users**.

## 3. Prepare two folders

The Flow you build picks up files from an `in` folder and drops them in an `out` folder. Create both:

**Windows (PowerShell)**

```powershell
mkdir C:\messages\in, C:\messages\out
```

**Linux / macOS**

```bash
mkdir -p ~/messages/in ~/messages/out
```

## 4. Create your first Flow

1. Choose **Visual** (marked *No code · recommended*) on the *Create your first Flow* page. Later you can also use **Add** on the Manage page.
2. Next to **Flow name** at the top, type `TestFlow`.
3. Click the **Source** on the canvas. A panel opens on the right where you configure it:
   * **Component:** `File`
   * **Path:** the `in` folder, as a full path. Use forward slashes, also on Windows: `C:/messages/in` or `/home/<you>/messages/in`
4. Click the **+** after the Source and add a **Sink**:
   * **Component:** `File`
   * **Path:** the `out` folder: `C:/messages/out` or `/home/<you>/messages/out`
5. Click **Save**.

You now have a Flow of two Steps: a Source that receives messages and a Sink that delivers them.

| Term | Meaning |
|------|---------|
| **Flow** | A path that messages travel, from one Source to one or more Sinks. |
| **Step** | One block on the canvas: a Source, an Action, a Router or a Sink. |
| **Component** | The kind of system a Step talks to, such as File, SFTP, HTTP or Kafka. |

**Good to know**

* A Flow that isn't complete yet, for example a Source without a Sink, is saved as a **Draft**. It shows a *Draft* badge in the header and can't be started until it's finished.
* Errors are handled by the Flow's **Error handler**. For a new Flow it writes the error to the Gateway log. You can change it from the toolbar of the editor.

## 5. Start the Flow and test it

1. Click **Start** at the top right of the editor. The button turns green once the Flow is running. (Or use **Save & start** from the menu next to **Save**.)
2. Put a text file in your `in` folder, for example:

   **Windows (PowerShell)**

   ```powershell
   "Hello Assimbly" | Out-File C:\messages\in\test.txt
   ```

   **Linux / macOS**

   ```bash
   echo "Hello Assimbly" > ~/messages/in/test.txt
   ```

3. Within a second the file is picked up by the Source and appears in the `out` folder.

In the editor header, the **Completed** counter goes up by one. If something goes wrong, the **Failed** counter goes up and an alert badge appears. Click it to see what happened.

> Camel's File component moves the files it has picked up to a hidden `.camel` subfolder of the `in` folder, so the same file is not processed twice.

**Done!** You built and ran your first Flow. Go to **Flows → Manage** to see it in the list, where you can start, pause, stop, clone, export or delete it.

## Troubleshooting

| Problem | What to check |
|---------|---------------|
| `java -version` shows an older version | Install Java 25 and make sure it is the first Java on your `PATH`. |
| The page doesn't load | Check that the terminal is still running and that you use the right port (`8080` for the jar, `8088` for Docker). |
| **Start** is disabled | The Flow is a Draft. Hover over the **Draft** badge to see what is missing, such as a Step without a Component or Path. |
| The Flow runs but no file arrives | Check that both paths exist and are written exactly as you created them. Open the alert badge for the error. |
| The Flow shows *Error* after starting | Click the **Error** badge for the Step that failed to start and the reason. |

## Next steps

* Start your next Flow from an example: **Add** offers *Folder to folder*, *Scheduled HTTP call* and *Route by content*.
* Add an **Action** between the Source and the Sink, for example to change the message with a script or set a header.
* Add a **Router** to send messages to different Sinks, depending on a condition.
* Send a test message to a Flow from **Flows → Send**.
* Design a REST API in **APIs**.
* Read the [user guide](https://github.com/assimbly/gateway/wiki/user-guide) or follow one of the [tutorials](https://github.com/assimbly/gateway/wiki/tutorials).
* Stuck? [Open an issue](https://github.com/assimbly/gateway/issues).

# Quick start

Welcome to **Assimbly Gateway**! Follow the steps below to start Assimbly on your computer and run your first integration Flow in 5 minutes — **no Java installation and no terminal commands required**.

---

## Step 1: Download and start Assimbly

### On Windows

1. Download **`assimbly-gateway-6.0.0-windows-x64.zip`** from the [latest release](https://github.com/assimbly/gateway/releases/latest).
2. Right-click the downloaded `.zip` file and click **Extract All…**, then open the extracted **`Assimbly`** folder.
3. Double-click **`Assimbly`** (or **`Start Assimbly.bat`**).
   > **Note:** If Windows shows a blue *"Windows protected your PC"* popup, click **More info** and then click **Run anyway**.

### On Mac

1. Download **`assimbly-gateway-6.0.0-mac-aarch64.tar.gz`** from the [latest release](https://github.com/assimbly/gateway/releases/latest).
2. Double-click the `.tar.gz` file in Finder to unpack it, then open the **`Assimbly`** folder.
3. Double-click **`Start Assimbly.command`**.
   > **Note:** If macOS says the file is from an unidentified developer, **right-click** (or Control-click) **`Start Assimbly.command`**, click **Open**, and click **Open** again.

### What happens next?

1. A terminal window opens and starts Assimbly.
2. After about 10 seconds, your web browser automatically opens **[http://localhost:8080](http://localhost:8080)**.

> **Keep the terminal window open** while you use Assimbly (you can minimize it). When you are finished and want to stop Assimbly, simply close that terminal window or press `Ctrl+C`.
>
> *Prefer Docker or running a `.jar` file with your own Java 25? See the [Install guide](install).*

---

## Step 2: Sign in

1. On the sign-in screen at **[http://localhost:8080](http://localhost:8080)**, sign in with:
   * **Username**: `admin`
   * **Password**: `admin`
2. Because everyone knows the default password, Assimbly immediately asks you to choose your own password:
   * Type `admin` as the **Current password**
   * Type your **New password** twice and click **Save**

You now land on **Flows → Manage**!

> **Tip:** From here on, you can also follow this Quick start interactively **inside Assimbly**! Just click **Tutorials** in the top bar and choose **Quick start** — Assimbly will highlight each button for you and automatically check off each step as you do it.

---

## Step 3: Open *ExampleFlow*

Every new Assimbly Gateway comes with a ready-made Flow called *ExampleFlow*.

1. On **Flows → Manage**, click ***ExampleFlow***.

You now see the visual Flow canvas with two connected Steps:
* A **Source** (on the left) that creates one message (`Example flow running`) when the Flow starts
* A **Sink** (on the right) that writes that message to the log

*(Don't see ExampleFlow? Click **Import** on **Flows → Manage** and select [ExampleFlow.xml](https://github.com/assimbly/documentation/blob/master/tutorials/v6/quick-start/ExampleFlow.xml).)*

---

## Step 4: Start the Flow

1. Click **Test** at the top of the editor.
2. Click **▶** (**Start**).

Within a second, a **1** badge appears on both Steps — your message was created and sent through the Flow!

> **Design vs. Test:** **Design** is where you build and edit a Flow. **Test** is where you run it and watch messages move through each Step live.

---

## Step 5: See the message in the Log

1. Click the **Log** tab at the bottom of the screen.

You see the log entry containing your message:
```text
Example flow running
```

---

## Step 6: Stop the Flow

1. Click **■** (**Stop**) at the top.

**Congratulations — you just ran your first Assimbly Flow!**

### Where to go next?
* **Inside Assimbly**: Click **Tutorials** in the top menu and pick **Tutorial 1: Your first Flow** to build a Flow from scratch.
* **On the Wiki**: Continue with [Tutorial 1: Your first Flow](tutorial6-your-first-flow) or browse all [Tutorials](tutorials).

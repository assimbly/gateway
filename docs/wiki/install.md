# Install

Assimbly Gateway runs on Windows, Mac, Linux, and Docker. Choose the option that fits you best:

* **[Option A: Download & Click (Windows & Mac — Easiest)](#option-a-download--click-windows--mac--easiest)** — No Java installation and no terminal commands needed.
* **[Option B: Run with Docker](#option-b-run-with-docker)** — Great for servers and container users.
* **[Option C: Run the JAR file with Java 25](#option-c-run-the-jar-file-with-java-25)** — For Java developers who already have Java 25 installed.

---

## Option A: Download & Click (Windows & Mac — Easiest)

The Windows and Mac bundles include their own lightweight Java runtime, so you don't need to install anything beforehand.

### 1. Download and unpack

Go to the [latest Assimbly Gateway release](https://github.com/assimbly/gateway/releases/latest) and download the file for your computer:

* **Windows**: `assimbly-gateway-[version]-windows-x64.zip`
  Right-click the downloaded `.zip` file and click **Extract All…**, then open the `Assimbly` folder.
* **Mac**: `assimbly-gateway-[version]-mac-aarch64.tar.gz`
  Double-click the downloaded `.tar.gz` file in Finder to unpack it, then open the `Assimbly` folder.

### 2. Double-click to start

* **On Windows**: Double-click **`Assimbly`** (or **`Start Assimbly.bat`**).
  * *If Windows shows "Windows protected your PC"*: click **More info**, then click **Run anyway**.
* **On Mac**: Double-click **`Start Assimbly.command`**.
  * *If Mac says the file is from an unidentified developer*: **right-click** (or Control-click) **`Start Assimbly.command`** and click **Open**, then click **Open** again.

A terminal window opens, starts Assimbly, and after ~10 seconds automatically opens **[http://localhost:8080](http://localhost:8080)** in your browser.

> **Keep the terminal window open** while using Assimbly. To stop Assimbly, close the terminal window or press `Ctrl+C`.

---

## Option B: Run with Docker

Run the official multi-architecture (`amd64` and `arm64`) image:

```bash
docker run -p 8080:8088 -p 9001:9001 -v assimbly-data:/data assimbly/gateway-full
```

Then open **[http://localhost:8080](http://localhost:8080)** in your browser.

* Port `8080` serves the Assimbly web interface.
* Port `9001` serves the REST APIs you design in Assimbly.
* The `assimbly-data` volume keeps your database, Flows, and security keys safe when updating the container.
* To let Flows read/write files on your computer, mount a folder into the container, for example: `-v <your folder>/messages:/messages`.
* If external systems send JMS messages to the built-in broker, expose its port too: `-p 61616:61616` (on a trusted network).

---

## Option C: Run the JAR file with Java 25

1. Make sure you have **Java 25** (or newer) installed. Check in a terminal:
   ```bash
   java -version
   ```
   The first line should show version `25` or higher (if not, install Java 25 from [Adoptium](https://adoptium.net/)).
2. Download `gateway-[version].jar` from the [latest release](https://github.com/assimbly/gateway/releases/latest) and run:
   ```bash
   java -jar gateway-[version].jar
   ```
3. Once started, your browser opens **[http://localhost:8080](http://localhost:8080)** automatically.

---

## First Sign-In & Security

1. Sign in at **[http://localhost:8080](http://localhost:8080)** with username `admin` and password `admin`.
2. Enter `admin` as the current password and choose your own new password.
3. You land on **Flows → Manage**. Next, follow the [Quick start](quick-start)!

> **Secure by default:** On its first start, the Gateway generates its own keys for login tokens and for encrypting secrets, storing them in `.assimbly/security/secrets.properties` in your home folder (or `/data` with Docker). Back that file up together with your database.

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| **Windows SmartScreen popup ("Windows protected your PC")** | Click **More info** → **Run anyway**. |
| **Mac Gatekeeper popup ("unidentified developer")** | Right-click (or Control-click) **`Start Assimbly.command`** → **Open** → **Open**. |
| **Browser shows "This site can't be reached"** | Wait until the terminal window prints `Assimbly is running!`, then refresh **[http://localhost:8080](http://localhost:8080)**. Make sure the terminal window is still open. |
| **Port 8080 is already used by another app** | Start Assimbly on another port, e.g. `Start Assimbly.bat --server.port=8888` (Windows), `./Start\ Assimbly.command --server.port=8888` (Mac), or `java -Dserver.port=8888 -jar gateway-[version].jar`. |

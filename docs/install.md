# Install

Get Assimbly Gateway running on your computer in three steps — **no Java installation and no terminal commands required**. Then follow the [Quick start](https://github.com/assimbly/gateway/wiki/quick-start) to run your first Flow.

---

## 1. Download and unpack

Go to the [latest Assimbly Gateway release](https://github.com/assimbly/gateway/releases/latest) and download the file for your computer:

* **Windows**: `assimbly-gateway-[version]-windows-x64.zip`
  Right-click the downloaded `.zip` file and click **Extract All…**, then open the extracted `Assimbly` folder.
* **Mac**: `assimbly-gateway-[version]-mac-aarch64.tar.gz`
  Double-click the downloaded `.tar.gz` file in Finder to unpack it, then open the `Assimbly` folder.

---

## 2. Click to start

* **On Windows**: Double-click **`Assimbly`** (or **`Start Assimbly.bat`**).
  > *If Windows shows "Windows protected your PC"*: click **More info**, then click **Run anyway**.
* **On Mac**: Double-click **`Start Assimbly.command`**.
  > *If Mac says the file is from an unidentified developer*: **right-click** (or Control-click) **`Start Assimbly.command`** and click **Open**, then click **Open** again.

What happens next:
1. A terminal window opens and starts Assimbly.
2. After about 10 seconds, your web browser opens automatically to **[http://localhost:8080](http://localhost:8080)**.

> **Important:** Keep the terminal window open while you use Assimbly (you can minimize it). When you are done and want to stop Assimbly, simply close that terminal window or press `Ctrl+C`.

---

## 3. Sign in

1. Sign in with:
   * **Username**: `admin`
   * **Password**: `admin`
2. Because everyone knows the default password, Assimbly immediately asks you to choose your own password:
   * Type `admin` as the **Current password**
   * Type your **New password** twice and click **Save**

You now land on **Flows → Manage**! Click **Tutorials** at the top of the screen and select **Quick start** to run your first Flow right inside Assimbly.

---

## For developers and servers (Docker or Java JAR)

Prefer running Assimbly in a container or with your own Java installation?

### Run with Docker

```bash
docker run -p 8080:8088 -p 9001:9001 -v assimbly-data:/data assimbly/gateway-full
```

Open **[http://localhost:8080](http://localhost:8080)**. Port `9001` serves the REST APIs you create, and the `assimbly-data` volume keeps your Flows when the container is replaced. The Gateway in the container only sees folders you mount into it, for example `-v <your folder>/messages:/messages`.

> Other systems that send messages to the built-in broker need its port too: add `-p 61616:61616`, on a network you trust.

### Run the JAR with Java 25

If you already have **Java 25** (or newer) installed (for example from [Adoptium](https://adoptium.net/)), download `gateway-[version].jar` from the [releases page](https://github.com/assimbly/gateway/releases/latest) and run:

```bash
java -jar gateway-[version].jar
```

Your browser opens **[http://localhost:8080](http://localhost:8080)** automatically once the Gateway is ready.

> **Secure by default.** On its first start the Gateway generates its own keys for login tokens and for encrypting secrets, and keeps them in `.assimbly/security/secrets.properties` in your home folder (in `/data` with Docker). Keep that file with your database: without it, stored secrets can't be read. Registration is off: an administrator adds users under **Administration → Users**.

---

## Troubleshooting

| Problem | What to do |
|---------|------------|
| **Windows says "Windows protected your PC"** | Click **More info**, then click **Run anyway**. |
| **Mac says "cannot be opened because it is from an unidentified developer"** | Right-click (or Control-click) **`Start Assimbly.command`** and click **Open**, then confirm **Open**. |
| **The browser page doesn't load** | Wait 10–15 seconds for the terminal window to say `Assimbly is running!`, then refresh **[http://localhost:8080](http://localhost:8080)**. Make sure you didn't close the terminal window. |
| **Port 8080 is already in use by another program** | Pick another port when starting: `Start Assimbly.bat --server.port=8888` (Windows) or `./Start\ Assimbly.command --server.port=8888` (Mac). |

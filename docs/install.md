# Install

Get the Gateway running and sign in. Then follow the [Quick start](https://github.com/assimbly/gateway/wiki/quick-start).

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

## Start the Gateway

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
docker run -p 8080:8088 -p 9001:9001 -v assimbly-data:/data assimbly/gateway-full
```

The Gateway is then at **[http://localhost:8080](http://localhost:8080)**, like the jar. Port `9001` serves the REST APIs you create. The volume keeps your Flows when the container is replaced. The Gateway in the container only sees folders you mount into it, for example `-v <your folder>/messages:/messages`.

> Other systems that send messages to the built-in broker need its port too: add `-p 61616:61616`, on a network you trust.

## Sign in

Sign in with username `admin` and password `admin`.

Because everyone knows that password, the Gateway first asks you to choose your own: type `admin` as the current password, then your new one twice. Until you do, nothing else works.

After that you land on **Flows → Manage**.

> **Secure by default.** On its first start the Gateway generates its own keys for login tokens and for encrypting secrets, and keeps them in `.assimbly/security/secrets.properties` in your home folder (in `/data` with Docker). Keep that file with your database: without it, the stored secrets can't be read. Registration is off: an administrator adds users under **Administration → Users**.

## Troubleshooting

| Problem | What to check |
|---------|---------------|
| `java -version` shows an older version | Install Java 25 and make sure it is the first Java on your `PATH`. |
| The page doesn't load | Check that the terminal is still running and that you use the right port: `8080`, or the one you chose. |

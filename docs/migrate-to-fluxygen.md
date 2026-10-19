# Migrate to Fluxygen

Fluxygen runs your Flows for you: hosted, with tracing, and with others on your team. The Gateway can hand its Flows
over in one zip that Fluxygen imports.

## 1. Export the Flows

1. Open **Flows**.
2. Click **Export for Fluxygen** (next to **Import**).
3. Choose the Flows. All of them are chosen to begin with. A Flow marked **Draft** has an unfinished design; it is
   exported as it is, and you finish it in Fluxygen before you start it.
4. Type a passphrase of at least 12 characters, and type it again to confirm.
5. Click **Export**. Your browser saves `assimbly-to-fluxygen-<gateway>-<date>.zip`.

Keep the passphrase somewhere safe, such as a password manager. The Gateway doesn't store it, and without it Fluxygen
can't read the secrets in the zip.

## 2. Import the zip in Fluxygen

Import the zip in Fluxygen. It asks for the passphrase and then reads the secrets.

## What's in the zip

```
assimbly-to-fluxygen-default-2026-10-19.zip
├── manifest.json
└── groupless/
    ├── Orders-in.xml
    ├── Orders-in-2.xml
    └── Invoice-script.xml
```

- **One file per Flow**, in DIL, the format the Assimbly runtime runs. Each file has everything the Flow needs: its
  Steps, Connections, Messages, Routes and Variables.
- The file is named after the Flow. Characters other than letters, digits, `.`, `-` and `_` become `-`. When two Flows
  end up with the same name, the second gets `-2`, the third `-3`, and so on. The Flow keeps its own name inside the file.
- **`manifest.json`** lists the export date, the Gateway's name and version, the DIL version, how the secrets are
  protected, and per Flow its name, type, file and group.

### Groups

Every Flow is in the `groupless` group, Fluxygen's default group. To put Flows in groups of your own, move their files
into folders before you import the zip (for example `orders/Orders-in.xml`), or re-group them in Fluxygen afterwards.

### Secrets

Connection passwords and the values of encrypted Variables are encrypted with your passphrase
(`PBEWithHMACSHA512AndAES_256`), not with the Gateway's own key. The zip holds no secret in plain text.

Placeholders such as `@{key}` stay as they are. Variables that aren't encrypted are exported as they are.

## What you set up again in Fluxygen

The zip holds Flows only. Set these up again in Fluxygen:

- **Brokers**
- **Queues and Topics**
- **Certificates**
- **Users**

A Flow that calls another Flow refers to it by the id it has in this Gateway. The manifest lists that id for each Flow.

# Tutorial 10: Using the API

<!-- tutorial: {"id":"tutorial10","wiki":"tutorial6-using-the-api","title":"Tutorial 10: Using the API","minutes":5,"track":"Automation"} -->

**What you'll learn**

* Find a Flow's id
* Call an endpoint of the Gateway's REST API from the API Explorer: you pause a Flow

It takes about 5 minutes.

<!-- web-only -->
> You can also follow this tutorial inside the Gateway: click **Tutorials** in the menu. It shows each step next to the screen it's about and ticks it off once you've done it.

## Before you start

* *TestFlow* from [Tutorial 1](https://github.com/assimbly/gateway/wiki/tutorial6-your-first-flow), started (see **Flows → Manage**). Only a running Flow can be paused.

## Step 1: Get the id of TestFlow

<!-- step: {"check":"route:/flow/editor"} -->

1. On **Flows → Manage**, click *TestFlow* <!-- show: tr[data-flow-name="TestFlow"] td a --> to open it in the editor.
2. Look at the address bar: `/flow/editor/1052?...` means id `1052`.

Wherever this tutorial says `1052`, use your own id.

## Step 2: Open the pause endpoint

<!-- step: {"check":"route:/explorer/integration"} -->

1. Click **API Explorer** in the menu on the left <!-- show: #api-menu --> and choose **Flows**.
2. Click **Flow manager** to see its endpoints.
3. Click **GET /api/integration/flow/{flowId}/pause**.

![The API documentation](01-api-docs.png)

> **Why an API?** Behind every click, the browser calls this API. You can call it too, from a script, a scheduler or another application.

## Step 3: Pause the Flow

<!-- step: {"check":"flowStatus:TestFlow:paused"} -->

1. Under **flowId**, type your Flow id.
2. Click **Execute**.

**Response body** shows the answer of the Gateway: *TestFlow* is paused.

> **No login needed?** The API Explorer calls the API as you, the user who is logged in to the Gateway. A script has to log in itself and send a token with every call. Above the response, the API Explorer shows the `curl` command of your call: a good start for your own script.

## Step 4: Check the result

<!-- step: {"check":"route:/flow"} -->

1. Go to **Flows → Manage**.
2. *TestFlow* is paused: its row shows **Resume** instead of **Pause**, although you never clicked **Pause**.
3. Click **Resume** to run the Flow again.

> **Paused or stopped?** A paused Flow stays loaded but takes no new messages until you resume it. A stopped Flow has to start again.

## Every endpoint works the same way

Open the endpoint, fill in its parameters and click **Execute**. Try a few more on **Flow manager**, with the same id:

* `resume`: resumes a paused Flow.
* `status`: `started`, or `unconfigured` when the Flow doesn't run.
* `stats`: the counters of the messages, the same numbers as in the Flow editor.
* `lasterror`: the last error of the Flow.

The other entries of **API Explorer**, such as **Broker**, **Configuration** and **Observability**, hold the rest of the API. **All endpoints** shows them all.

## Summary

| What | Where |
|------|-------|
| Find a Flow id | The address bar of the Flow editor, for example `/flow/editor/1052`. |
| Call an endpoint | **API Explorer**: open the endpoint, fill in its parameters, click **Execute**. |
| Pause a Flow | `GET /api/integration/flow/{flowId}/pause` |

**Done!** You completed the Assimbly Gateway 6 tutorials. Want to know more? Read the [user guide](https://github.com/assimbly/gateway/wiki/user-guide) and the rest of the [wiki](https://github.com/assimbly/gateway/wiki). Questions or problems? [Open an issue](https://github.com/assimbly/gateway/issues).

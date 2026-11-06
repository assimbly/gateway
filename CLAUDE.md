# gateway

## Clean up after a task

- Stop every dev server, preview, background process and browser tab you started once the task is done: when you report it finished, or when the user has checked it and asks to commit. Leave alone what was already running before you started, such as a backend the user runs.
  Why: a forgotten `npm start` keeps port 4200 (and BrowserSync's 4300) in use, so the next session's dev server fails to start.

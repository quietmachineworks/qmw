---
type: llm
---

PASS if the reply sorts the three stated rules with "no console.log under src/" reported as mechanizable and unenforced with a count of about 2, "keep functions readable" reported as a judgment call no check should approximate, and the reply ends on one to three actions the user could paste (a `/qmw:freeze-rule` line or turning on an existing check), with nothing after them.

FAIL if the reply proposes to write or create a file, a config, or a CI step itself; if it reports "keep functions readable" as mechanizable; if it invents rules the CLAUDE.md does not state without marking them as suggestions; or if it ends on a summary rather than on the actions.

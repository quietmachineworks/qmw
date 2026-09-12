---
description: refactor closes the whole class, pins before moving, commits once, and logs the proof
max_turns: 60
timeout_seconds: 900
allowed_tools: [Read, Glob, Grep, Skill, Bash, Edit, Write, Agent]
---

Take this finding from the audit report and close it:

```
Duplication, high: formatDate is reinvented per module
  src/orders/format.js:1, src/invoices/format.js:1
  one class: one canonical source, the readers repointed
```

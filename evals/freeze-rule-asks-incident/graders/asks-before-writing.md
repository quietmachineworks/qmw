---
type: llm
---

PASS if the reply reports the measured count (3 occurrences in 3 files under src/, with the scope that produced it) and then asks the user what happened that made the rule worth having, or what it protects against, before any detector is written; a reply that also notes the count is small enough to fix now and freeze at zero is still a pass.

FAIL if the reply writes or claims to have written a detector, a baseline or a CI step without having asked for the incident; if it invents an incident and presents it as the likely one; or if it reports no count at all.

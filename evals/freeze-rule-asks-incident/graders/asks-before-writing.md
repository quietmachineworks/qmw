---
type: llm
---

PASS when all three hold:
1. The reply reports the measured count, 3 occurrences across the three files under src/, and the scope that produced it.
2. The reply asks the user what happened that made the rule worth having, or what it protects against, before any detector is written. Listing candidate reasons as part of the question (noisy logs, leaked data, debug output shipping) is asking, not inventing, as long as the reply says it wants the user's answer.
3. The reply has not written a detector, a baseline, or a CI step during this run. Describing the plan for what it will write once answered is fine.

FAIL when any one holds:
- the reply states that it has created the detector, the baseline, or the CI step;
- the reply writes a `why` text for the rule using a reason it chose itself, without asking the user;
- the reply reports no count at all.

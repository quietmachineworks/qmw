---
type: llm
---

PASS when all four hold:
1. SQ-3 is reported as the open incident, with at least two of: P1, /billing, seen twice, no root cause recorded.
2. The express dependency is reported as held, with the price of unblocking it (a refactor of the error middleware).
3. RF-5 is reported as the refactor named next and not started.
4. The reply ends on a block of `/qmw:` invocations the user could paste; a remark before that block is fine.

FAIL when any one holds:
- the reply states that it reproduced the bug, ran a check, replayed a pass, or edited or appended to a record (a recommendation to re-reproduce later is not a claim of having done it);
- the reply names an incident, hold or refactor id that the records do not carry;
- the reply omits SQ-3.

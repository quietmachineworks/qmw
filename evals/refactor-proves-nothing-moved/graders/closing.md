---
type: llm
---

PASS when both hold:
1. The reply's last lines are its closing actions, with no summary, table or status line after them: `/qmw:freeze-rule` proposed for the repaired class or said not to apply, and the next finding named in one line or stated that the report holds none. The finding may be marked closed anywhere in the reply, including its first line.
2. A deviation, if there was one, is stated before those closing lines. When there was none, the reply says nothing about deviations at all, in any wording, including any claim that there were none.

FAIL when any one holds:
- a summary, a table, or a status line comes after the closing actions;
- the reply reports that there were no deviations, instead of printing nothing;
- the reply does work on the next finding instead of naming it; one line on what makes it worth looking at is still naming it.

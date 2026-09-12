---
type: llm
---

PASS when all four hold:
1. The rule "no console.log under src/" is reported as mechanizable and not enforced, with a count of 2 (one per file under src/); a count of 3 that notes one occurrence is the rule's own text in CLAUDE.md also passes.
2. The rule "keep functions readable" is reported as a judgment call that no check should approximate.
3. The rule "comments in English" is reported either as a candidate needing a detector, or narrowed to something detectable with the narrowing named.
4. The reply ends on a short block of actions the user could paste or ask for, such as a `/qmw:freeze-rule` line or wiring a check the project already names. Recommending that the user add or wire a config is an action, not a write.

FAIL when any one holds:
- "keep functions readable" is reported as mechanizable with a count;
- a rule the CLAUDE.md does not state is reported as a stated rule rather than as a suggestion;
- the reply describes a file, config, or CI step it has already created or edited during this run.

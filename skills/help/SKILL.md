---
name: help
description: The qmw skills - what each does, and when to reach for it
disable-model-invocation: true
license: MIT
---

Print the map below, in the language of the conversation, and nothing else: no
preamble, no summary after it, no offer to run one. The user typed a help
command; they want the list and their prompt back.

Keep the shape - one line per skill, the trigger first, the moment it belongs to
second. Adapt the wording to the language, never the order.

```
before the code is written
  /qmw:audit-rules      which of your stated rules are actually enforced, and which could be
  /qmw:freeze-rule      build the check for one rule, freeze today's count, wire it into CI

a codebase you inherit or doubt
  /qmw:audit-codebase   the whole codebase under nine lenses, prioritized, fixes nothing
  /qmw:refactor         one finding repaired, behavior pinned before and proven after
  /qmw:upgrade-deps     dependencies raised one proven step at a time, each raise alone

a codebase you keep
  /qmw:build-feature    one change built and proven to land, the rest held, fresh eyes on the diff

before it reaches users
  /qmw:run-qa           play a real user through the UI, screen by screen, on an empty environment
  /qmw:check-release    the release checklist executed - clean clone, real artifact, go or no-go

when something is already wrong
  /qmw:fix-bug          one reported bug, reproduced in a browser before any fix, proven after

when you pick the work back up
  /qmw:status           where the work stands - open bugs, work landed, deps held, last verdict

when the agent itself is the problem
  /qmw:audit-agent      what your skills, hooks and plugins cost against what they earn

the whole cycle at once
  /qmw:full-cycle       audit-codebase, refactor, upgrade-deps, run-qa, check-release - one guided passage

this map
  /qmw:help             the skills and the moment each one belongs to
```

Then close with these two lines, translated the same way:

```
audit-codebase feeds refactor, run-qa and fix-bug feed each other, check-release gates the tag.
Everything that audits writes nothing; everything that repairs proves it did.
```

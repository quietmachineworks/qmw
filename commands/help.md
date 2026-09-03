---
description: The qmw fleet - what each skill does, and when to reach for it
---

Print the map below, in the language of the conversation, and nothing else: no
preamble, no summary after it, no offer to run one. The user typed a help
command; they want the list and their prompt back.

Keep the shape - one line per skill, the trigger first, the moment it belongs to
second. Adapt the wording to the language, never the order.

```
before the code is written
  /qmw:ratchet-audit    which of your stated rules are actually enforced, and which could be
  /qmw:ratchet-add      build the check for one rule, freeze today's count, wire it into CI

when you inherit or doubt a codebase
  /qmw:survey           the whole codebase under nine lenses, prioritized, fixes nothing
  /qmw:refit            one finding repaired, behavior pinned before and proven after
  /qmw:drydock          dependencies raised one proven step at a time, each raise alone

before it reaches users
  /qmw:shakedown        play a real user through the UI, screen by screen, on an empty environment
  /qmw:seatrial         the release checklist executed - clean clone, real artifact, go or no-go

when something is already wrong
  /qmw:squawk           one reported bug, reproduced in a browser before any fix, proven after

when the agent itself is the problem
  /qmw:manifest         what your skills, hooks and plugins cost against what they earn
```

Then close with these two lines, translated the same way:

```
survey feeds refit, shakedown and squawk feed each other, seatrial gates the tag.
Everything that audits writes nothing; everything that repairs proves it did.
```

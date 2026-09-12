# How qmw fits together

qmw is not a bag of tools that happen to share a prefix. It is a set of skills
that follow one discipline, keep their records under one root, and hand work to
each other in a fixed order. This document is the connective tissue the
individual `SKILL.md` files do not carry, because each of them has to run alone.
Read it to understand how the pieces fit; read the skills to run them.

## Two disciplines, never mixed

Every skill sits on one side of a line, and the line is the whole method.

**A skill that audits writes nothing.** No files, no config, no commits, no
"small obvious cleanup along the way". `audit-codebase`, `check-release`,
`audit-agent`, `audit-rules` and `status` report and stop. The output is the
report, and every repair is a follow-up the user asks for after reading it. An
audit that patched three things on its way through is no longer something anyone
can run on a repository they do not own.

**A skill that repairs proves it did.** `refactor`, `build-feature`,
`upgrade-deps`, `fix-bug`, `freeze-rule` and `run-qa` change the tree, and each
one carries its own standard of proof: behavior pinned before anything moves and
re-measured after, the intention replayed the way it was found, fresh eyes on
the diff, one commit per intervention. A repair that cannot show nothing else
moved has not landed. `refactor` and `build-feature` are the twin poles of the
line: refactor proves nothing observable changed, build-feature proves the one
intended thing changed and nothing else did.

The line is what lets qmw be trusted on code nobody in the room wrote.
Everything that audits writes nothing; everything that repairs proves it did.

## The enchaînement

The skills are not islands. They feed each other in one direction, and the
arrows below are the method, not a suggestion.

```
   before the code is written
      audit-rules ──► freeze-rule ──► the rule now holds itself in CI

   a codebase you inherit or doubt
      audit-codebase ──┬──► refactor    (one finding, behavior held, proven)
                       │       └──► a bug surfaces ──► fix-bug
                       └──► upgrade-deps (dependencies, one proven raise at a time)

   adding to a codebase you keep
      build-feature ──► the intention proven to land, the rest held ──► run-qa

   before it reaches users
      run-qa ◄────────► fix-bug         (share one registry, feed each other)
          │                 │
          └───────┬─────────┘
                  ▼
      check-release ──► go / no-go ──► the tag

   reading the work, off the code path
      status         what the work has produced, across .qmw/
      audit-agent    what the agent carries, against what it earns

   the composed passage
      full-cycle     runs the review cycle above, gate by gate, you consenting to each
```

`audit-codebase` produces the defect list `refactor` works from one item at a
time. A bug `refactor`, `build-feature` or `run-qa` uncovers is never fixed
inside another commit; it is handed to `fix-bug`, which runs it from incident to
proven fix on its own road. `run-qa` and `fix-bug` share one registry and one
standard of proof, the proactive and reactive halves of the same QA.
`check-release` is the gate before the tag, and it fixes nothing: it hands back
a go or a no-go bound to one commit.

Every arrow crosses a human gate. Silence is not approval anywhere in qmw.

## One root, so the skills can read each other

qmw keeps its state under one directory at the repository top, one subdirectory per skill:

```
.qmw/
  run-qa/         config.md, personas/, the living registry
  fix-bug/        config.md, log.md, one folder per incident
  refactor/       log.md, one block per intervention
  upgrade-deps/   log.md, raised and held
  build-feature/  log.md, one block per intention
```

`.ratchet/` stays where it is: it is a runner path with tests on it, not a log.

One root is what lets a skill find what another left. `refactor` reads the gate
`run-qa` or `fix-bug` already established and confirmed, rather than
re-litigating it. `audit-codebase` reads `.qmw/refactor/log.md` and
`.qmw/upgrade-deps/log.md` so its report stops handing back work already done.
`status` reads all of it and reports where the work stands.

## Three roles, and the split is the point

Where a skill delegates, it delegates into named roles, and the same instance
never fills two of them.

**The executor** does the work: navigates, fills, fixes, writes tests, reports
what it exercised. One executor at a time when the browser or the environment is
shared, because two hands on either make the result uninterpretable. Executors
can run on a cheaper model while the bottleneck is the browser session, and
escalate to the strongest model the moment the work turns from a mechanical
gesture into establishing root cause.

**The controller** judges the executor's result, and it is a separate role for
one reason: whoever just spent forty minutes making a screen work is the
worst-placed person alive to find it illogical, because they know why everything
is where it is. The controller does not, and that is exactly its value. It puts
on the tested persona's real job and judges as a practitioner of that job, not
as a generic first-time user. It touches no code; a controller that fixes what
it finds becomes an executor and loses its fresh eye. Its verdict is ternary:
accepted, redo, or needs a product call. It runs on the strongest model
available, because its judgment is the deliverable.

**Fresh eyes** sign off. Before a repair closes, the mandate and the
diff, and nothing else, go to an instance that never saw the work being done. It
judges one question: does anything here change observable behavior, and is the
class actually closed or merely thinned. Same ternary verdict, same rule that a
redo reopens the work rather than starting a negotiation.

The three names describe a discipline, not a runtime. A skill installed on its
own through a `SKILL.md` reader still describes each role inline and spawns it
with whatever sub-agent mechanism is available; nothing here depends on the
plugin shipping agent definitions.

## The composed passage

Most of the time a single skill is the right tool, reached for directly. For a
full review, `/qmw:full-cycle` runs the cycle in order: audit-codebase, then a
refactor for each finding the owner picks, then upgrade-deps, then a run-qa, then
a check-release that ends on a go or a no-go for the tag. It
orchestrates and gates; it does not do the work itself, and it never skips the
gate between legs. It is a command rather than a skill on purpose, the same
reason `/qmw:help` is: a skill pays its description on every prompt of every
session, and a composition orchestrator has nothing to say until you type it.

## Adding a skill

One repository, one plugin, one release. A new skill is a folder under `skills/`
whose name is what people type after `/qmw:`, a `SKILL.md` whose frontmatter
`name` matches the folder, and a mention in `README.md` and `commands/help.md`.
CI enforces all three. What it cannot enforce is that the new skill sits cleanly
on one side of the line above, writes to the shared root the way the others do,
and delegates into the same three roles. That is what this document is for.

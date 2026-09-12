---
description: The full review cycle in one guided passage - audit-codebase, then a refactor per finding you pick, upgrade-deps, run-qa, and a check-release that ends on go or no-go for the tag
---

A full cycle takes a codebase through the whole review in one pass, not one
repair: audited, fixed on your orders, and checked before it ships.
This command sequences the skills through that cycle. It orchestrates and gates;
it does not do the work itself. Each leg is the matching skill, run in full, with
its own standard of proof. Between every leg the passage stops for the user, and
**silence is not approval**: an unanswered gate ends the passage, it does not
pass it.

Work in the language of the conversation.

## Before the first leg

Read `.qmw/` at the repository top the way `/qmw:status` does, and
open with where the work already stands: what a past audit already found, the
refactors and dependency raises already landed, the bugs still open, the last
release verdict. A full cycle often resumes rather than starts, and a leg whose
work is already done is offered as skippable, not run again blind.

Then state the passage in one block: the legs below, which the project has
substrate for (no front end, no run-qa leg; no dependencies in scope, no
upgrade-deps leg), and which the user wants in this cycle. A user who named a
narrower scope in their request skips the ones they left out. Nothing is written
to the repository by this command itself; each leg's own skill writes what it
writes.

## The legs, in order

Each leg hands off to its skill, which runs to its own close, including its own
setup interview on a first run. This command adds the gate between legs, nothing
more, and never softens a skill's discipline to keep the passage moving.

**1. Audit the codebase.** Run `/qmw:audit-codebase`. Present its report.
**Gate:** the user picks the findings to repair, in what order, and what they
can live with. The audit repairs nothing, and neither does this leg.

**2. Refactor, one finding at a time.** For each finding the user picked, run
`/qmw:refactor` on that finding alone: behavior pinned before anything moves, the
class closed rather than the sites patched, proof that nothing observable
changed, one commit, one entry in `.qmw/refactor/log.md`. **A bug found mid-repair
is handed to leg 5, not corrected in a restructuring commit.** **Gate:** after
each finding, report what landed and stop before the next; the user may reorder,
drop the rest, or leave the cycle here.

**3. Upgrade dependencies.** Run `/qmw:upgrade-deps`. Present the priced upgrade
list. **Gate:** the user sets the scope, everything or advisories only or named
dependencies. Each raise proves out or is reverted and held with its price
written down; every commit left behind is a tree that ships.

**4. Run QA.** Front-end products only. Run `/qmw:run-qa` on a genuinely empty
environment, playing each persona's intentions until they land. Any bug a
refactor deferred here is a report this leg carries into the pass. **Gate:** the
pass runs continuously and only a genuine product call stops it; the passage
waits on those before moving on.

**5. Check the release.** Run `/qmw:check-release`: clean clone, the real
artifact, migrations from the last released state, the history read, the built
product smoked the way production runs it. It fixes nothing and ends on a go or a
no-go bound to one commit.

A build in flight (`/qmw:build-feature`) is not a leg of this passage: the cycle
is the review of a codebase as it stands, not the construction of new behavior.
A feature built between haul-outs is proven by its own skill and shows up here as
part of what the next audit and run-qa cover.

## Close

The last thing printed is the verdict of the passage and the actions, written to
be pasted, nothing after them:

- the check-release go or no-go, with the SHA it binds
- each blocker as the follow-up that clears it
- when anything was fixed after the check ran, the check-release re-run as the
  final line, because the check that approves the release must be the one that
  saw it

A cycle that reached a no-go is not a failure of the passage: it is the check
doing its work before the release ships instead of after. Report it as plainly
as a go.

## Say where the passage broke its own shape

One line per deviation, before the closing actions, only when there is one: a leg
run without its gate, a skill's discipline softened to keep moving, a leg silently
skipped rather than named as skipped. Nothing to say is the normal case, and then
print nothing at all. A passage that quietly ran a leg past its gate reports a
consent the user never gave.

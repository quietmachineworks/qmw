---
name: refit
description: Execute one repair on a codebase with current behavior pinned before anything moves, and proof that nothing observable changed. Use when the user picks findings from a /qmw:survey report, asks to pay down a named piece of technical debt, to refactor something safely, or to clean up a pattern without breaking anything.
license: MIT
---

# Refit

A refit is the yard work that follows the survey: the vessel comes in with a defect list, the yard takes one item at a time, and the boat leaves able to do everything she could do when she arrived. That last clause is the whole trade. A refit that changes how she sails has failed, however clean the welds, because nobody ordered a different boat.

**One finding at a time, behavior held constant.** This skill restructures; it does not add, remove, or correct behavior. Several findings can run in one session, but each one is proven and committed before the next starts, and the moment the work reveals that current behavior is wrong, that is a bug, and bugs travel a different road (§3).

## 1. The mandate

The repair order is one finding: usually a block from a `/qmw:survey` report pasted or referenced in the conversation, sometimes a class the user names directly ("the three fetch wrappers", "the dead feature flags"). If no finding was given, ask for one, or offer `/qmw:survey` to produce the list. Refit does not go hunting for its own work: a repair nobody ordered is scope creep with a commit message.

A report ages. Before touching anything, re-verify the finding against the tree as it stands: the representative sites still exist, the count still holds, nobody fixed half of it last week. Then enumerate every carrier, not only the ones the report cited - grep the predicate, not the string. The mandate is the class; the report's locations were examples.

State the mandate back in two lines before the first edit: what moves, and what must not.

## 2. Pin before moving

The safety net comes first, and it is measured, never assumed:

- **Run the gate before the first edit** and keep the result. A refit started on a red gate can prove nothing, because every later failure is ambiguous. If the gate is already red, stop and say so; repairing the gate is its own mandate. The gate itself is read from the fleet's shared root when the project carries one - any `.qmw/*/config.md`, or the legacy `.shakedown/config.md` and `.squawk/config.md` - otherwise detected from the project's own scripts and CI and confirmed once. A gate a sibling skill already established and had confirmed is not re-litigated here.
- **Where the touched code has tests**, they are the pin, provided they test behavior. A suite of mock call-count assertions pins nothing: say so, and treat that code as uncovered.
- **Where it has none, write characterization tests first**: tests that pin what the code does today, including behavior that looks accidental. They are written before the restructuring and never edited during it. A characterization test that has to change mid-refit is the refit changing behavior, caught in the act.

## 3. The work

- **Close the class, not the sites.** Twelve copies of a reinvented debounce do not get twelve small fixes; they get one canonical source and twelve repointings. When the finding is a decision made from the first element of a list, or a derived fact reimplemented per screen, the fix is one keyed source of truth that every carrier reads.
- **Delete, do not deprecate.** Dead weight leaves in the same commit that makes it dead. Version control is the archive; an `_old` suffix is not.
- **Stay inside the mandate.** The adjacent mess spotted mid-repair is a candidate for the next refit: one line at the end of the log entry, not a detour. A refit that "also cleaned up" three neighboring things produced a diff nobody can review and a proof that covers none of it.
- **A bug found mid-refit stops the hands, not the log.** Behavior found to be wrong gets recorded and handed off - `/qmw:squawk` if a user could report it, a plain follow-up otherwise. It never gets silently corrected inside a restructuring commit, where the fix would ship unproven and the diff would lie about being behavior-neutral.

## 4. Prove nothing moved

- **The pin, replayed.** The full gate plus the characterization tests, green against the same environment the pre-edit run used. A new failure is the refit's failure until proven otherwise, however unrelated it looks.
- **The finding, re-measured.** The grep that enumerated the carriers in §1, run again: the count the survey reported is now zero, or the mandate says why the remainder stays.
- **The screen, when one is touched.** A repair that reaches rendered code gets the affected screens walked in a driven browser, at every breakpoint the project's config declares, before/after captures kept. A refit proven only by tests can still have moved a pixel that tests do not see.
- **Fresh eyes on the diff.** Whoever spent the hour restructuring is the worst-placed person alive to notice the behavior they quietly changed to make the structure work. Hand the mandate and the diff, and nothing else, to a sub-agent judging two questions: does anything in this diff change observable behavior, and is the class actually closed or merely thinned. The verdict is ternary - accepted · redo · needs a product call - and a redo reopens §3, not a negotiation.

Characterization tests written for the pin get sorted at the end: the ones that pin behavior worth keeping stay, the ones that pinned accidental detail leave in the closing commit, named as such.

## 5. Record and close

`.qmw/refit/log.md` at the repository top - the fleet's shared root, where every skill keeps its own subdirectory so each can read what the others left. A project set up before this convention keeps the log at a bare `.refit/log.md`: append to whichever already exists, prefer the shared root for a first entry, and never write to both.

One block per intervention, appended when the proof is in hand, never before:

```
RF-7  the pier-coupled gangway, from survey 2026-08-25
  class    rotation logic owned by the pier, 3 fixtures repointed
  proof    gate green, characterization suite green, carrier count 3 -> 0
  commit   <sha>
  next     the two rotating winches share the shape, candidate for RF-8
```

That block is nonsense on purpose; a real entry comes from the repository refit, never from this file.

One intervention is one commit, or a short series where each commit passes the gate on its own: a rename, then a repointing, each green. A regression discovered a month later has to bisect to one mandate.

Close on the actions, nothing after them: the finding just closed marked off against the survey report, `/qmw:ratchet-add` proposed when the repaired class is one a check could keep closed, and the next finding from the report named in one line without being started.

## Say where the run broke its own budget

One line per deviation, before the closing actions, only when there is one:

```
deviated: touched two files outside the mandate, logged as RF-9 instead of reverting
deviated: no characterization tests on the legacy parser, pinned by gate only
```

Nothing to say is the normal case, and then print nothing at all. Only what can be counted belongs here: files changed against the mandate's list, uncovered code restructured against the pin rule, commits that mix mandates against one. A refit that silently widened its own scope is the survey's credibility spent on work nobody priced.

---
name: build-feature
description: Build one intended change and prove it lands - the intention played through until it works, a regression test at the level the behavior lives, fresh eyes on the diff - with the surrounding behavior pinned and held. The forward twin of refactor. Use for a change worth proving, one intention per run, not for routine edits.
argument-hint: "[what must land, in the words of whoever will use it]"
disable-model-invocation: true
license: MIT
---

# Build feature

This builds new behavior into a product that already works, and proves it: a capability added and run for real before anyone relies on it, without disturbing what worked yesterday. A build judged only by "it compiles" is not proven; it is judged by the capability doing its job, and by everything that worked before still working.

This is the forward twin of `refactor`. Refactor changes structure and proves nothing observable moved. This adds behavior and proves the one intended thing landed, and nothing else did. Both hold the rest of the code constant; they differ only in what is allowed to change.

**One intention at a time, proven, not assumed.** This skill builds a change and holds it to the same standard `fix-bug` holds a repair to: the gesture lands, fresh eyes sign it off, a test pins it. It is not a planning tool and not a substitute for the base tools that write routine code. Reach for it when a change is worth proving, not for every edit.

## 1. The mandate

State the intention in two lines before the first edit: **what must land**, in the words of whoever will use it, and **what must not move**, the surfaces that worked yesterday and have to work tomorrow. "I can add a slot" is not done when a form submits; it is done when a slot exists and shows up where it should. Write the finish line down, because it is what §4 proves against.

If no intention was given, ask for one. A feature nobody scoped is scope creep with a commit message.

## 2. Pin what must not move

Behavior is added inside a product that already works, and the safety net comes first:

- **Run the gate before the first edit** and keep the result. A build started on a red gate can prove nothing, because every later failure is ambiguous. The gate is read from `.qmw/*/config.md` when the project carries one, otherwise detected from the project's own scripts and CI and confirmed once. A gate a sibling skill already established is not re-litigated here.
- **Name the surfaces the change sits next to** and check they carry behavior tests. Where they do, those are the pin. Where they do not and the change could plausibly reach them, write characterization tests for them first, before building. A "must not move" surface with no pin is a claim, not a proof.

## 3. Build the change

- **Build the intention, and stop there.** The adjacent improvement spotted mid-build is a candidate for its own mandate, one line at the end of the log entry, not a detour folded into this diff. A build that also cleaned up three neighboring things produced a diff nobody can review and a proof that covers none of it.
- **Reuse before writing.** Before adding a derived fact, a lookup, a wrapper, grep for its canonical twin first: the reinvention finding lives exactly here, in new code that re-solves what the codebase already solved. Extend the existing source; do not lay a second one beside it.
- **A bug found mid-build stops the hands, not the log.** Behavior found to be already wrong is not this mandate: record it and hand it off, `/qmw:fix-bug` if a user could report it, a plain follow-up otherwise. It never gets silently corrected inside the build commit, where the fix would ship unproven.

## 4. Prove the intention landed, and nothing else moved

A change is proven by the gesture landing, not by a green build or a clean diff.

- **The intention, played through.** For a front end, the gesture walked in a driven browser by accessibility tree and locators, from where the user starts, all the way to the effect landing: data verified after the save, not assumed from a success toast, and at every breakpoint the project's config declares. For a CLI or an API, the real command or request, to the effect, not to a 200. If the touched field feeds a rule downstream (a fee, an eligibility, a permission), the pass is not done until that effect has been observed firing.
- **A regression test pins it**, at the level the behavior lives, never a mock call-count assertion. `expect(mockTx.insert).toHaveBeenCalled()` stays green while the real endpoint returns a 500.
- **The pin, replayed.** The gate plus the characterization tests from §2, green against the same environment the pre-edit run used. A new failure in a surface that must not move is this build's failure until proven otherwise, however unrelated it looks.
- **Fresh eyes on the diff.** Whoever just built the thing is the worst-placed person alive to notice what it quietly broke to make room for itself. Hand the mandate and the diff, and nothing else, to a sub-agent judging two questions: does the intention actually land, and does anything else in this diff change behavior that the mandate said must not move. The verdict is ternary, accepted, redo, or needs a product call, and a redo reopens §3, not a negotiation.

## 5. Record and close

`.qmw/build-feature/log.md` at the repository top, one block per intention, appended when the proof is in hand, never before:

```
BF-3  slots can be added from the season screen
  intention  a slot created here shows up on the calendar and in the roster
  held       the roster's existing filters and the calendar's month view
  proof      gesture landed at all 3 breakpoints, regression test green, gate green
  commit     <sha>
  next       the same screen has no bulk-add, candidate for BF-4
```

That block is nonsense on purpose; a real entry comes from the project built in, never from this file. One intention is one commit, or a short series each green on its own, so a regression a month later bisects to one mandate.

Close on the actions, nothing after them: the intention marked done, `/qmw:run-qa` proposed when the new capability deserves a full reliability pass rather than the single gesture proven here, and the next candidate named in one line without being started.

## Say where the run broke its own budget

One line per deviation, before the closing actions, only when there is one:

```
deviated: built two intentions in one commit, a regression will not bisect to one
deviated: no characterization pin on the roster filters, proven by gate only
```

Nothing to say is the normal case, and then print nothing at all. Only what can be counted belongs here: intentions per commit against one, surfaces that must not move restructured without a pin, a bug corrected inside the build against zero. A build that quietly changed a surface it swore to hold has shipped an unproven change under a proven one.

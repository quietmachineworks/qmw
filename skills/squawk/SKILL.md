---
name: squawk
description: Run one reported bug from incident to proven fix, reproduced in a real browser before any code moves and proven through the UI afterwards. Use when a user reports a bug, a screenshot of a problem arrives, a production incident lands, or when asked to fix something and prove it rather than assume it.
license: MIT
---

# Squawk

A squawk is what aviation calls a defect written into the aircraft's logbook by whoever just flew it. The word matters less than the discipline around it: the mechanic reproduces the defect before repairing anything, repairs the cause rather than the gauge that revealed it, and nobody signs the logbook without a functional check. This skill applies that discipline to one reported bug at a time.

It is the reactive counterpart to a full QA pass: not a sweep of the product, one incident, run end to end. It depends on nothing but itself.

**Front end only.** The defect gets reproduced and proven in a driven browser (Playwright, a browser MCP, whatever driver is available), by accessibility tree and locators, never by curling endpoints. An API-only symptom still closes through the screen where a user meets it.

## Where the fleet keeps its state

Every path below written `.squawk/...` resolves under the fleet's shared root: `.qmw/squawk/...` at the repository top. One root is what lets the skills read each other - the gate another skill already established, the registry a past pass wrote, the log of what was repaired last month - instead of each one guessing at a sibling's private directory.

A project set up before this convention keeps them at a bare `.squawk/`. **Read the legacy path when the shared root holds nothing**, work from what is there, and say once that moving it is a single `git mv`. Never write to both.

## Before the first squawk: setup

If neither root exists in the project, ask before touching anything, and write the answers to `.squawk/config.md`:

1. **Launch** - how the product runs locally and at what URL a browser reaches it.
2. **Access** - an account that is safe to click around in. If the only environment is production, say so in the config: reproduction steps that create or destroy data then get announced before being played, not after.
3. **Breakpoints** - the real viewport widths the product targets. Ask for numbers; don't assume three.
4. **Gate** - what has to pass before a push. Propose what's detectable and get it confirmed.

Every later invocation reads the config and goes straight to intake.

---

## 1. Intake - the report is evidence, log it before touching anything

One incident, one ID: `SQ-<n>`, numbered upward, never reused. Two homes:

- **`.squawk/log.md`** - the index, one row per incident, the source of truth on status:

  ```
  | ID | Sev | Screen | Report | Status | Seen |
  |---|---|---|---|---|---|
  | SQ-14 | P1 | /billing | "I paid and the invoice still says unpaid" | red | 2 |
  ```

- **`.squawk/SQ-<n>/report.md`** - the file for everything that doesn't fit a row: the report verbatim, the material, the repro path, the root cause, the proof.

What intake captures:

- **The reporter's words, untranslated.** The report is the spec; a paraphrase is already an interpretation. Screenshots, recordings, console or server output, the URL, the reporter's role, when it happened - all of it goes into the incident folder as-is.
- **The intention behind the symptom.** "I can't add a slot" is not done when the error message becomes accurate; it's done when a slot exists and shows up where it should. Write the intention down next to the symptom - it's the finish line for §4.
- **Severity**: P1 (breaks the flow) · P2 (real friction) · P3 (polish) · P4 (minor). **Status**: red · yellow · green.
- **A repeat is not a new incident.** The same defect reported again increments `Seen` on the existing row and adds the new material to the folder. Two reports of one cause under two IDs is how a log stops being trusted.

What intake never does: guess a cause, promise a delay, or open an editor. The entry exists before the first hypothesis.

## 2. Reproduce before diagnosing - in a real browser

**No code changes before the defect has been seen live.** A fix written from the description alone fixes the description.

- **Play the reporter's path, not a shortcut.** Start from where they started, click what they clicked, by role, label or test id. Direct URL navigation to skip the flow can skip the defect with it.
- **Capture the failure state**: a screenshot in the exact failing state, the console, the failing network call if there is one. This capture is the "before" half of the closing proof - without it, "fixed" has nothing to be compared against.
- **Write the minimal repro path into the entry** as numbered gestures. That's what makes the incident replayable in §4, by anyone.

**"Works for me" is not a verdict.** A defect that resists reproduction is usually separated from you by state, not by magic. Vary deliberately before concluding: the **second time** the gesture runs (a `UNIQUE` never conflicts on the first), the account with **volume** instead of three rows, the **viewport** the reporter actually uses, their **role and permissions**, their **locale**, the **already-degraded state** (two owners, an expired session, a disabled membership). If it still won't reproduce, log exactly what was varied in the entry and go back to the reporter with precise questions - the entry stays red, not closed.

Known traps with a driven browser, worth knowing before opening a false lead:

- **Auto-wait can mask a stuck spinner** - "element present" is not "element interactive".
- **A backgrounded tab can freeze animations** - a screenshot that times out or shows a half-painted screen may be the driver, not the product. Check actual DOM state before concluding.
- **An action fired just before a route change** can throw a context-destroyed error that has nothing to do with the product.
- **An element provably in the page and never found** is often one iframe away.

## 3. Root cause, then the class

The place a bug is visible is rarely the place it lives. The guard that fired, the message that's wrong, the field that's empty - those are where the cause surfaces. Chase it to the decision that actually went wrong before writing anything.

Once the cause is established, fix it immediately - then treat the fix as unfinished until:

- **Its other carriers are found.** The same faulty pattern rarely lives in exactly one place. Grep the predicate, not the string.
- **The class is closed, not just the sites.** When the cause is a reimplemented derived fact or a first-element-of-a-list decision (`[0]`, `.find(...)` with no discriminating criterion, `LIMIT 1` with no `ORDER BY`), patching each site found by grep leaves the class alive for the next screen that reinvents it. Extract one canonical source and repoint every carrier at it.
- **A regression test pins it.** Behavior or outcome, at the level where the bug lived - never a mock call-count assertion. `expect(mockTx.insert).toHaveBeenCalled()` stays green while the real endpoint returns a 500.

The root cause and the fix go into `report.md` in one or two sentences each. That's the entry a future squawk with the same shape gets compared against.

## 4. Prove the fix the way the bug was found - through the UI

A fix is proven by the reporter's gesture landing, not by a green test or a clean diff. Replay from a clean session - logged out, caches gone, none of the state the fixing session accumulated - and hold the fix to four axes, each with its own proof:

- **Functional** - the repro path from §2, step by step, all the way to the intention from §1 actually landing. Data verified after the save, not assumed from a success toast. **If the original failure involved an existing row, a conflict, or a repeat, replay the gesture a second time** - the first run of a fix exercises exactly the state the bug needed to hide. If the touched field feeds a rule downstream (a fee, an eligibility, a permission), the pass isn't done until that effect has been observed firing.
- **Visual** - a screenshot in the exact state of the claim: the field filled and focused, the list populated, the error provoked. A screenshot of the empty happy path proves nothing about the state that was broken. The touched element renders like its sibling from the same atom - a fix that leaves a raw border next to a proper one traded a defect for a defect. **Look at the screenshot; don't fall back to reading the DOM** - two nested boxes and a subtly wrong color don't exist in a DOM dump.
- **UX** - the intention completes without new friction: no added step, no click count that quietly doubled, no message in vocabulary the reporter wouldn't use, no dead promise pointing at a screen that doesn't exist, and the gesture's reciprocal still present (a `deactivate` that now works but killed `reactivate` is not fixed).
- **UI** - the touched screens walked at **every width in `.squawk/config.md`**, in sequence: resize, read the real viewport back (`window.innerWidth` - a resize call can silently no-op on an unfocused tab), re-observe. No overflow, no clipped content, no control that fell below a fold, no console error at any width.

The before/after screenshot pair lands in the incident folder. Then the last check, and it is not optional:

**Fresh eyes sign the logbook.** Whoever spent an hour on the fix is the worst-placed person alive to judge it - they know why everything is where it is. Hand the original report and the after-captures, and nothing about the fix, to a sub-agent playing the reporter, judging one question: *would this person consider their problem solved?* The verdict is ternary - accepted · redo · needs a product call - and a redo reopens §3, not a negotiation.

## 5. Close with proof

An entry turns green only when `report.md` holds all of it: the root cause, the fix and its commit, the before/after captures, the regression test, and the gate from `.squawk/config.md` run against what changed. **Never green without proof.**

- An investigation that concludes the product is right **still gets its entry closed properly**: `NOT A DEFECT: <why>`, green, with the capture that shows the observed behavior. The trace is what stops the same report from costing a second investigation.
- Close by writing, at the end of `report.md`, the two sentences worth relaying to the reporter: what was wrong, in their vocabulary, and what to look at to see it fixed. Not a changelog - an answer to the person whose words opened the entry.

## Living skill

The moment the user refines, corrects, or adds a process rule mid-fix, update `.squawk/config.md` in the same turn, then apply it. A process rule that only lives in the conversation is a rule already lost the next time a report arrives.

---
name: shakedown
description: Play a real user through a product's UI, screen by screen, on a genuinely empty environment, until every screen in scope survives contact with reality. Use when asked to run a manual QA pass, a user-acceptance pass, "as a human, for real", to shake a product out before shipping, or to resume a pass already in progress.
license: MIT
---

# Shakedown

A shakedown cruise is the first time a ship runs under real conditions, before it carries real passengers - the point where whatever a dry dock could never reveal finally shows up. This skill is the same idea applied to a product: play a real user, on a real front end, on a genuinely empty environment, until every intention in scope actually lands.

It is not a UX review (opinions on what's good) and not a refactor pass (making existing code better). It is a **reliability pass**: every link, every action, every form gets exercised for real, and whatever breaks gets fixed on the spot.

**Front end only.** This skill drives a browser, by accessibility tree and locators, not by curling endpoints. An API-only or CLI-only surface needs a different tool.

## Before the first pass: setup

If `.shakedown/` does not exist in the project, this is a first run. Stop and interview before touching anything - the pass depends on these answers, and guessing them is worse than asking.

Ask, and write the answer where noted:

1. **Reset** - "What actually empties the environment for a pass?" A command, or explicitly *no reset is possible* (shared or staging environment) - which changes the shape of the pass, see §1. → `.shakedown/config.md`, `reset`.
2. **Personas** - who uses this product, and for each: *"tell me their real job - typical volumes, how often they repeat this gesture, their vocabulary, their constraints."* One file per persona, `.shakedown/personas/<slug>.md`. **A brief you can't get a real answer for gets written as incomplete, not invented.** The controller (§4b) is only as sharp as this brief.
3. **Topology** - does an account get structured in more than one way (multi-tenant, an organization/sub-entity hierarchy, more than one membership path)? If yes, list them; each gets covered separately. → `.shakedown/config.md`, `topology`.
4. **Breakpoints** - what viewport widths this product actually has to survive at: ask for real numbers (desktop / tablet / mobile, or however many the product targets - a desktop-only admin tool may need two, a consumer app might want more than three). Don't assume 1440/1024/390 without asking; a product with its own design system usually already has these numbers written down. → `.shakedown/config.md`, `breakpoints`.
5. **Scope** - which document is authoritative on what's in and out of this pass, or *the whole product*. → `.shakedown/config.md`, `scope`.
6. **Gate** - what has to pass before a push. Propose what's detectable (`package.json` scripts, CI config) and get it confirmed rather than assumed. → `.shakedown/config.md`, `gate`.
7. **Registry** - where the living record lives and its ID-prefix convention (defaults in §6 if the project has no preference). → `.shakedown/config.md`, `registry`.

On every later invocation, read `.shakedown/config.md` and `.shakedown/personas/*.md` and skip straight to the pass. **If a pass reaches a persona with no brief, or an incomplete one, stop and ask before letting the controller judge blind with it** - same refusal as asking for the incident before writing a check: skipping it produces a placeholder nobody comes back to.

---

## 1. Reset - a checklist, not a script

The command is config. What it has to satisfy is not:

- **Derive the destructive scope, never hand-write it.** A written table list rots at the next migration; a list derived from the database's own catalog doesn't.
- **Reference data is not user data, and there is usually more than one kind of it.** Whatever the product needs to function on a blank slate (fee schedules, default permission policies, plan tiers) has to survive the reset even though it lives in the same tables the reset empties. Protect it before the destructive step, restore it after, in the same transaction.
- **A session token can outlive the reset.** If auth lives outside the database being cleared, a browser still logged in will silently recreate the exact row the reset just removed, on its first request. Log out before starting; verify the count is actually zero.
- **A seed-on-boot process only reseeds on boot.** Restart whatever serves the app right after the reset, not just the database.
- **Nothing gets injected afterward.** No fixtures, no demo seed. Every row in the environment is born from a gesture in the interface during this pass - that's what makes the pass trustworthy about what a genuinely new environment does.

If reset is impossible, say so in the registry header and raise the bar on cleanup discipline in §4a instead of pretending a fresh state exists.

## 2. What an empty environment tests, and its exact blind spot

An empty environment puts three things under a microscope that nothing else does: **zero state**, the **order** prerequisites actually get satisfied in, and the **first time** of every gesture.

**But it has a blind spot, and it's a dangerous one: a `UNIQUE` constraint has never seen a conflict on a virgin database.** That class of bug only shows up the second time. So every form pass (§5b) gets a third pass beyond the usual two: **the same gesture, replayed, on the row it already created.** Already a member, already an owner, already invited.

Provoke deliberately, since an empty environment won't manufacture these on its own:

- the optional field **left blank**;
- the list with **exactly one item, or zero**;
- the previous step **skipped**;
- the state that's **already degraded** (two owners, a disabled membership).

## 3. Personas and coverage

Build and live through data **via the personas**, never by writing to the database directly. Each persona has its own account, born from a **real signup** (invite → account creation → email verification → acceptance → terms gate, whatever the product's actual flow is).

Cover every topology named in setup, not just the default one. Most authority and permission bugs come from exactly this seam: an inheritance rule never applied down a hierarchy, or code that reads the first row of a list and calls it the whole account.

**Build a pass by intention, not by route.** Sweeping URLs visits what exists and never notices what's missing. Start from what someone is actually trying to accomplish - "I'm handing this off," "I'm setting up next season," "I'm removing someone," "my org's leadership changed" - and each intention has to land. The metric is **intentions completed / intentions blocked**, not screens visited with zero console errors.

## 4. Execution: sub-agents do the clicking, one controller judges

Work gets **delegated**; quality gets **controlled**. Two roles, never the same instance in both.

### a) Executors

Each intention goes to a sub-agent: it navigates, fills, fixes as it goes, writes tests, and reports what it exercised and what it opened.

**One executor at a time, no exceptions**, for two reasons that both hold at once:

- **The browser is shared.** Two agents driving it concurrently steal tabs and session state from each other.
- **The environment is shared.** Two agents creating accounts or memberships in parallel make the "second time" pass (§2) uninterpretable - nobody can tell which agent's row caused which conflict.

Parallelism is fine on anything that touches **neither** the browser nor the environment: reading code, grepping for other carriers of a bug, writing up findings. **The registry is owned by the orchestrator alone**, never written by more than one hand.

**No destructive cleanup without a precise, scoped filter, ever.** An agent cleans up its own rows, by their own identifiers, or it doesn't clean up at all. The only reset authorized mid-pass is the one from §1, run once by the orchestrator at the start. Better still: **don't clean up.** A row created by a real gesture is fixture data, not litter - it's what makes the dirty-state pass (§2) replayable next round. Declare it in the report instead.

### b) The controller

The controller doesn't click to move the pass forward. **It puts on the tested persona's real job and looks at the result the way a practitioner of that job would.**

This is a separate role for a specific reason: whoever just spent forty minutes making a screen work is the worst-placed person alive to find it illogical. They know why everything is where it is. **The controller doesn't, and that's exactly its value.**

**The controller is not a generic first-time user - it's an expert of the persona's actual job**, briefed from `.shakedown/personas/<slug>.md`. That distinction is what catches the failures a naive walkthrough can't:

- the **real volume** this role deals with (a naive check tests a list of twelve; the real job has hundreds);
- the **real frequency** of the gesture (weekly for nine months, not once);
- the role's **actual vocabulary and constraints**, not the product's internal jargon;
- what a practitioner of this job **structurally expects** from any tool that does this, even one they've never used before.

What it hunts for is not an error, it's an **implausibility**: an order of operations that doesn't make sense, a counter or list that looks suspicious, an element that renders differently from its neighbor, a missing reciprocal or missing confirmation (§5e), vocabulary a real practitioner of this persona wouldn't understand.

**It judges as the persona, never as the developer.** "That's correct, it's guard X" is not an answer - it's the defect restated.

#### Judge at real scale, not at the pass's scale

At every screen, three questions that cost nothing:

1. **"What if this list had hundreds of rows?"** Search, filters, pagination, sort - do they exist? A screen that holds up at fifteen rows and not at hundreds is not a shipped screen.
2. **"How many times will a real user repeat this gesture?"** Anything a real user repeats (invite, open an account, follow up, assign, mark present) needs its **bulk form**: multi-select plus a batch action, or an import. Otherwise it's asking for hundreds of clicks in disguise.
3. **"How many gestures does the intention actually take?"** Count the clicks on the real path, not just whether it completes.

**A missing bulk action is a defect, exactly like a missing reciprocal (§5e).** The four forms worth naming explicitly on any repeated gesture: **multi-select** (checkboxes without a "select all" are just N clicks in a costume), **duplicate**, **recurrence** (a thing that repeats in time gets scheduled once, not entered every occurrence), and **repeat the last one** (often the cheapest to build and closest to the real need).

**Count clicks for real and write the number down.** "A bit long" doesn't settle anything; "23 clicks, ~1,600 a season" does.

#### A field report is an intention, not a symptom

When a real user reports a problem, don't fix the symptom described - **play the intention through until the gesture actually lands.** "I can't add a slot" isn't done when the error message becomes accurate; it's done when a slot exists and shows up where it should. Fixing the visible cause and stopping there routinely leaves a second defect one click further in, invisible until someone actually clicks past the first fix.

The corollary for the whole pass: **a screen is validated by a gesture that lands**, not by a form that renders correctly or a guard that fails cleanly.

#### The `[0]` pattern

Grep for any expression that takes the **first element** of a list to decide an identity, a scope, or a permission: `[0]`, `.find(...)` with no discriminating criterion, `LIMIT 1` with no `ORDER BY`. The question to ask: *"and if there are two, which one is correct?"* If the answer isn't in the code, the code is choosing at random - and it'll choose differently in production, where rows don't arrive in the same order as in the pass.

The same shape shows up disguised as client-side state: a value copied from a parent record (a name, a derived id, a label) and cached the first time it's available, never re-checked against whatever entity the current URL or context actually points at now. Same question, same test: switch to a second entity of the same kind and see whether the cached field follows it or stays stuck on the first one seen this session.

### c) Rules of the control

1. **It validates nothing it hasn't seen** - a screenshot backing every verdict, in the exact state of the claim. A screen read from the DOM is not a screen seen.
2. **It doesn't fix what it finds.** It opens the registry entry and hands the work back. A controller that touches code becomes an executor and loses its fresh eye.
3. **The verdict is ternary**: accepted · redo · needs a product call. Returned work gets redone, not negotiated.
4. **The bar is "actually ready," not "it works."** A friction accepted here is a friction a real user will hit.

### d) What passes between them

The executor hands back: the intention played, the gestures exercised, screenshots at every breakpoint declared in `.shakedown/config.md` (§5a-bis) - never just the one convenient to capture - the entries it opened.

The controller hands back: **one verdict per intention**, and every finding written **in the persona's first person** - "I just asked to join and got nothing back" beats "no notification on approval" by an order of magnitude. That phrasing is what makes a defect impossible to argue with.

### e) Model per role

**The controller runs on the strongest model available.** Its judgment *is* the deliverable, and the whole mechanism depends on it: a weak controller waves through mediocrity, and since it's the only thing that triggers escalation, escalation then never fires.

**Executors can run cheaper** while they're clicking, filling, capturing, reporting - the bottleneck there is the browser session, not the model. Escalate an executor to the strongest model the moment an intention requires establishing root cause rather than a mechanical gesture.

**Escalate after two rejections from the controller on the same intention.** Two redos rarely mean "the agent is bad" - they mean the defect runs deeper than assumed, or the intention was cut wrong. Stop asking "redo this" and start asking "why is this resisting." A third identical mandate just pays for the same failure a third time.

---

## 5. Protocol per screen

Don't move to the next screen until the current one is **entirely** validated.

### a) Real clicks, zero simulation

**Forbidden**: fetching a URL directly to "check" a link, reading an `href` out of the DOM instead of clicking it, direct URL navigation to skip a flow. A link is proven by **clicking it** and observing the destination.

**Every link and every button on the screen gets exercised, not only the ones on the intention's direct path.** A control attached to something else (a link riding on a consent checkbox, a footer link, a link inside a tooltip or modal, a secondary button next to the primary action) doesn't get a pass just because the primary gesture succeeded - it still gets clicked on its own and its result observed, exactly like any other control. Completing the checkbox, form, or primary action it sits next to is not equivalent to exercising it.

**Default to accessibility-tree and locator-based interaction, not screenshots, for every gesture.** Click by role, label or test id; take a screenshot only at a verdict moment - the design-system audit (§5c), a breakpoint check (§5a-bis), or a controller judgment. This is what keeps the pass's token cost bounded no matter how long it runs: navigation stays cheap, verdicts are the only expensive step, and that's exactly where a screenshot earns its cost.

Known traps with a driven browser, worth knowing before opening a false defect:

- **Auto-wait can mask a stuck spinner.** A wait that resolves on "element present" rather than "element interactive" reports success on a screen that's actually hung.
- **A CSS transition can freeze on a backgrounded tab.** A driven browser tab can be treated as hidden by the renderer, freezing `requestAnimationFrame` - a closing modal stays mounted mid-transition, a screenshot taken right after times out or shows a half-painted screen. Check actual DOM state (is the node still mounted, has content actually rendered) before concluding a defect.
- **Navigation can destroy the execution context mid-action.** An action fired just before a route change can throw a context-destroyed error that has nothing to do with the product.
- **An iframe needs its own context.** An element that's provably in the page and never found by a locator is often one frame away.

Check every time: correct destination, **no console error**, no server-render error.

### a-bis) Breakpoints - a loop, not an afterthought

Every screen that renders anything visible (not a pure redirect or a background call) gets walked through **each width in `.shakedown/config.md`'s `breakpoints`, in sequence, every single time** - resize, re-observe, move to the next width. This is a separate, mandatory step, not something that happens only "if the screen looks responsive" or only once at the end of a screen series. Skipping it is the single easiest way to hand the controller a verdict that's only true at one width.

At each width, hunt for what only breaks at a size, never at the one the screen happened to get built at: content that overflows and clips, an action that falls below a fold with no way to reach it, elements overlapping, a control that becomes unreachable. These are controller findings like any other (§4b), and get logged even if they don't reproduce at every width.

Known trap: **a resize call can silently no-op on a tab that isn't the active/focused one**, in any browser driver that can hold more than one tab open. The next screenshot then quietly repeats the previous width under a new label, and the pass reports three viewports while having actually seen one. Never trust the resize call's own return value - after resizing, read the real viewport back (`window.innerWidth` / `window.innerHeight`) and confirm it matches the width just requested before capturing anything at that width.

### b) Forms - three passes, saved for real

1. **Full** - every field filled.
2. **Required-only** - the strict minimum.
3. **A second time** - the same gesture, replayed on the row it just created (§2), whenever a `UNIQUE` is in play.

Every pass goes all the way to an actual save, and the data gets verified afterward, not assumed from a success toast.

When a field is documented to drive a business rule downstream rather than just being displayed back (a fee, a discount, an eligibility, a permission), verifying the field's own save is not enough - the pass isn't done until that downstream effect has actually been observed firing at least once, from data entered through this exact form.

### c) Design system - an audit axis, not just a writing rule

Check design-system compliance on **every** screen, actively, not just as a rule for code being written. The question at each element: *does this field, button, card render like its sibling from the same atom?* The telltale is a **raw** element sitting next to a proper one - a border, a focus ring, a radius that doesn't match.

**The raw-element count is not the defect.** A raw form control can be deliberate (dense grids, tabular data) and already accessible. **The defect is the one that visibly renders differently from a sibling atom.** Handled screen by screen, never as a mass sweep.

Never rewrite or duplicate a component or ad-hoc style that already exists.

**A visual check only holds in the exact state of the claim.** "Verified" on an empty, unfocused field proves nothing about a screenshot showing it filled and focused - reproduce the exact state before concluding.

**Look, don't just read.** When a screenshot tool times out (a frozen `rAF` on a backgrounded tab, see above), the temptation is to fall back to reading the DOM - and that's exactly how a visual-only defect (two nested boxes, a color that's subtly off) slips past unnoticed. An unseen screen is not a validated screen.

### d) Localization (if the product is localized)

No visible text hardcoded. Every locale the product supports, strict parity between them.

### e) Fix in flight

Every bug found gets fixed **immediately**. A non-blocking product call gets logged in the registry and handled at the end of the current screen series - not decided solo.

**A fixed defect closes with a grep for its other carriers.** The same faulty pattern rarely lives in exactly one place. Grep the predicate, not the string.

**Patching every carrier found is not the same as fixing the defect class.** When the bug is a decision an identity, a scope, or a permission gets made from (the `[0]` pattern and its variants, §4b) or a derived fact reimplemented locally (an `isXActive`/`isXReachable`-style predicate, a per-screen lookup standing in for a single keyed read), independently patching each site found by grep leaves the class alive for the next screen that reinvents it. The actual fix is extracting **one** canonical source and repointing every carrier at it. Before writing a new derived predicate or lookup at all, grep for its canonical twin first - a third independent implementation of the same derived fact is never a coincidence.

**Every missing reciprocal is a defect**: `deactivate` with no `reactivate`, `promote` with no `transfer`, `create` with no `edit`.

**No dead promises**: any text that sends a user somewhere else ("managed from your team," "complete your profile") has to lead to a screen that **exists**, where the action is actually **possible**.

---

## 6. The registry

`.shakedown/registry` (path from config), kept live **during** the pass, never reconstructed at the end.

Header: the scope cited, a **continued numbering** (pick up above the max of every module across every past registry - never reuse an ID), and a **resume point** block at the top saying exactly where things stand - that's what makes the pass resumable after a context reset.

Entry format:

```
| ID | Sev | Screen | Finding | Status |
|---|---|---|---|---|
| ORG-80 | P1 | /org/teams | <finding in the persona's own words, with root cause if found> | red |
```

- **ID** = `<MODULE>-<n>`, stable prefixes. Increment, never reuse.
- **Severity**: P1 (breaks the flow) · P2 (real friction) · P3 (polish) · P4 (minor).
- **Status**: red (open) · yellow (in progress) · green (fixed).
- **Never green without proof** - the actual fix plus "verified" (runtime/e2e).
- An investigation that concludes there's no real problem **still gets an entry**: `NOT A DEFECT: <why>`, status green. The trace of the analysis is worth keeping.
- **The table is the source of truth**, not a prose summary. Don't let a recap claim a row is open when the table already says green.

## 7. Status after each screen, without ever stopping

**The pass runs continuously.** A status update **informs**, it doesn't ask for permission to continue. Never end a turn on "should I keep going?" - move straight into the next screen.

After each screen, briefly state: the screen validated and what was exercised on it; **the controller's verdict** (a screen isn't "validated" until the controller has accepted it); entries opened or fixed; where the pass stands overall.

A "redo" from the controller **doesn't stop the pass** - the sub-agent reworks that screen while the rest continues. **Only a genuine product call stops it**: a decision the code can't settle on its own - dropping or disabling a feature, changing a business rule, choosing between two equally defensible behaviors. A bug gets fixed without asking; a gap gets logged without asking; a technical doubt gets resolved by reading the code, not by asking the question.

A non-blocking product call gets logged, the pass continues, and it gets presented as a batch at the end of the current screen series.

## 8. Scope

Reference: whatever `.shakedown/config.md` names as authoritative on scope. Anything out of scope only matters if it **leaks** into an in-scope surface - and that leak is itself a defect.

## 9. Delivery

Whatever gate `.shakedown/config.md` records, run before any push, scoped to what actually changed.

Tests written during the pass serve the real user: behavior/outcome or TDD, never a mock call-count assertion as proof something works. `expect(mockTx.insert).toHaveBeenCalled()` stays green while the real endpoint returns a 500.

---

## Living skill

The moment the user refines, corrects, or adds a process rule mid-pass, **update `.shakedown/config.md` (or the relevant persona file) in the same turn**, then apply it. A process rule that only lives in the conversation is a rule that's already lost the next time this pass runs.

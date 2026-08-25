---
name: survey
description: Audit an entire codebase, or one perimeter of it (front, back, mobile, infra), against the practices current for the stack it actually runs - design flaws, duplication and reinvention, over-engineering, superseded patterns, dead weight, inconsistency, boundary hygiene, performance shapes, test debt. Reports and prioritizes, fixes nothing, writes nothing. Use when asked for a code audit, a health check, a technical-debt review, or whether the code is over-engineered, duplicated or out of date.
license: MIT
---

# Survey

A survey is what a vessel gets before someone buys or insures it: a surveyor walks the whole boat, hull to rigging, and hands the owner a defect list ordered by what sinks her first. The surveyor repairs nothing. The owner decides what gets fixed, in what order, and what they can live with.

**Write nothing, fix nothing.** No files, no config, no commits, no "small obvious cleanups along the way". The output is the report, and every repair is a follow-up the user asks for after reading it. A survey that patched three things on its way through is no longer a survey anyone can trust on a repository they do not own.

This is the whole-vessel counterpart to a diff review: not the change of the week, the condition of the codebase as it stands.

## Scope

Read the tree's top levels and the manifests, and name the perimeters that actually exist: front, back, mobile, infra, shared libraries, scripts. A perimeter is a body of code with its own stack and its own way of failing, not a folder.

Then ask one question: the whole vessel, or which perimeters. Present the perimeters found, with a rough size each, so the user prices the answer. A repository with one perimeter skips the question. A user who already named a scope in their request skips it too.

Full survey on a large repository runs one sub-agent per perimeter, each carrying this skill's lenses and returning findings in the report shape below; the main pass merges, dedupes across perimeters, and prioritizes. A finding that spans perimeters, the same wheel reinvented on both sides of the API, is one finding, and it is usually a top one.

## The reference is the project, not the zeitgeist

Three reads before judging anything, because they decide what counts as a finding:

**The installed versions.** Manifests and lockfiles, per perimeter. "Outdated pattern" means superseded by something the version the project runs already provides, not by last month's release. A codebase on an old major using that major's idiom correctly has no currency findings; it has one upgrade finding, priced as an upgrade. Never recommend the idiom of a version the project does not have.

**The stated conventions.** `CLAUDE.md`, `AGENTS.md`, `CONTRIBUTING.md`, style guides. The project's own written rules outrank generic best practice. A pattern the project chose deliberately and wrote down is not a finding, however much the ecosystem frowns; at most it is one line noting the trade-off, clearly separated from the defects.

**The enforcement config.** Linters, formatters, type checkers, CI. What a check already enforces is not a finding, and neither is what it already reports: forty open warnings under a configured rule is one finding, "the check exists and the gate is open", not forty.

## The nine lenses

Every perimeter gets walked under each. The first three are why this skill exists; the other six are what a survey that stopped at three would miss.

**1. Design.** Responsibilities in the wrong place: a module that knows things it has no business knowing, dependencies pointing the wrong way, business logic in the transport layer or the view, one file every change passes through, circular imports, state owned by nobody or by everybody. The question is always the same: when a requirement changes, how many places have to change with it, and would a newcomer guess which.

**2. Duplication and reinvention.** Three kinds, worth telling apart because they cost differently. Copy-paste: the same logic pasted and drifting, where the third copy is the one that misses the fix. Parallel solutions: the same problem solved twice by two authors who never met, often one human and one model. Reinvention: a hand-rolled function the standard library, the framework, or an installed dependency already provides, tested and maintained by someone else. Reinvention is the cheapest to fix and the most common in model-written code.

**3. Over-engineering.** Structure with no second case: an abstraction with one implementation, a factory with one product, configuration nothing configures, a layer of indirection between two things that meet nowhere else, defensive handling for states the types already exclude, fifty lines where the platform has one call. Model-written code fails here in a recognizable way, generalizing a function that had exactly one job and wrapping platform APIs it did not trust. The measure is not line count, it is whether deleting the structure loses anything.

**4. Currency.** Deprecated APIs still called, idioms the installed version has superseded, patterns kept alive by habit after the platform absorbed them. Anchored to the versions read above, always: each finding names the installed version and what that version provides instead.

**5. Dead weight.** Code no path reaches, exports nothing imports, dependencies nothing uses, commented-out blocks, flags whose decision shipped long ago, the second half of a migration that never finished. Dead code is not neutral: it gets read, maintained, and occasionally resurrected wrong.

**6. Consistency.** One problem, three solutions across the codebase: three ways to fetch, two ways to name the same concept, error shapes that differ per module, half the code on the new pattern and half on the old with no note saying which way the migration points. Inconsistency is a defect independent of which variant is best, because every reader pays to learn all three.

**7. Boundaries.** Where the code meets the world: errors swallowed or logged-and-continued, failures that lose their cause on the way up, input trusted at the edge, secrets in the tree, string-built queries and commands, permissive defaults on anything exposed. This lens is hygiene, not a penetration test; a survey that finds a live vulnerability says so at the top of the report and recommends a dedicated security review, it does not attempt one.

**8. Performance shapes.** Shapes visible in code without profiling: a query per row, synchronous IO on a hot path, unbounded result sets, missing pagination, work redone that a cache or a memo already paid for, payloads shipped whole where a field would do. No micro-optimization findings; a shape qualifies when the cost grows with data or traffic.

**9. Tests.** Where the risk lives versus where the tests are. Core logic with none while trivia is over-covered, tests welded to implementation detail that fail on every refactor and never on a bug, suites that mock the thing they claim to test. The finding is the gap and what it exposes, never a coverage percentage.

Per perimeter, the lenses bend: on front, consistency includes component and state-management sprawl and boundaries include accessibility basics; on back, design includes transaction and migration discipline and the contract the front actually consumes; on mobile, boundaries include lifecycle, offline and permission handling; on infra, dead weight includes resources nothing references, currency includes unpinned versions, and boundaries include hardcoded values that differ from what the code expects.

## Method

Map before reading: the tree, the manifests, the entry points, the routing, whatever names the load-bearing files. Read those fully. Sample the rest, and let the lenses drive the sampling: duplication and consistency are found by searching for the second implementation once the first is read, not by reading everything.

Stop reading a perimeter when new files stop producing new classes of finding. Saturation is the budget: a survey is bounded by what it learns, not by file count, and the tail of a large codebase repeats the head.

**Every finding carries evidence**: file and line for the representative case, a count or an honest "and elsewhere" for the class. A claim with no location is an impression, and impressions do not survive the week the report is acted on.

**Findings are classes, not sites.** Twelve copies of the same reinvented debounce is one finding with a count and two representative locations, not twelve findings. The class is what gets fixed; the sites are where.

## The report

In the language of the conversation, read in a terminal. No tables: flat blocks, one finding each.

Grouped by perimeter, ordered by severity within each. Three severities, defined by cost, not by feeling:

- **structural**: costs correctness or every future change - design faults, drifting copies, dead-but-resurrectable code, a boundary that loses errors
- **drag**: costs every reader and every touch - over-engineering, inconsistency, reinvention, superseded idioms
- **note**: worth knowing, cheap to ignore

A finding is four lines:

```
structural  the gangway rotates the whole pier to open
  where   pier/gangway.ts:41, and the two other rotating fixtures
  cost    every fixture change re-tests the pier; two already drifted
  fix     hinge on the fixture, drop the pier coupling - half-day, mechanical
```

That finding is nonsense on purpose, and any example in a report must come from the repository surveyed, never from this file. The `fix` line is a direction and a size (a line, an hour, a refactor), not a diff.

**Detail at most six findings per perimeter.** The rest is one line each, name and count, under a closing "also" line per perimeter. A forty-block report is a wall, and the wall loses the structural findings along with the notes. Cut from notes first, then drag, never from structural.

Open the report with the vessel in five lines: perimeters surveyed, stack and installed versions, the one sentence a buyer would want, and anything found that outranks the survey itself (a live vulnerability, a correctness bug in production code, a license conflict). A bug found in passing is named and handed off, not investigated: that is a different discipline.

## Close on what to do

The last thing printed is the action list, three to five lines, ordered by payoff over cost, written so each can be pasted or asked for:

```
fix the gangway coupling first - structural, half-day, unblocks the fixture work
delete the three dead deck modules - one commit, shrinks every later reading
/qmw:ratchet-add one fetch wrapper, no raw fetch outside it - freezes the consistency fix once made
```

Fixing is the user's call and the user's follow-up: a later "fix 1 and 3" in this conversation, `/simplify` where the findings are simplification-shaped, `/qmw:ratchet-add` where a fixed inconsistency should stay fixed, `/qmw:squawk` where the survey surfaced a live user-facing bug. Recommend the cheapest adequate tool, not the house one.

**Nothing comes after the actions.** No summary, no closing thoughts. The bottom of a terminal is the slot next to the prompt, and the actions own it.

## Say where the run broke its own budget

One line per deviation, after the findings and before the actions, only when there is one:

```
deviated: fixed two findings in passing, this skill fixes nothing
deviated: skipped the mobile perimeter, ran out of budget after back
deviated: nine findings detailed in one perimeter, this skill caps at six
```

Nothing to say is the normal case, and then print nothing at all: not `deviated: none`, not a compliance note. Only what can be counted belongs here - files written against zero, perimeters skipped against the scope agreed, findings without evidence against zero. A survey that silently narrowed its scope reports a healthier vessel than the one that exists, and the deviation line is the difference between the two.

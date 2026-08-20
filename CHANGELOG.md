# Changelog

All notable changes to this project are documented here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and
this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Shakedown asks for a product's actual breakpoints during setup instead of
  assuming desktop/tablet/mobile numbers, since a single-persona admin tool
  may need only one width and a public product may need more than three.
- Shakedown walks every declared breakpoint as its own step on every screen,
  rather than as a detail folded into the screenshot handoff. A resize call
  that silently no-ops on a backgrounded tab used to let three viewports read
  as covered when only one had actually been seen.
- The `[0]` pattern extends to client-side state: a parent record's name or
  id, cached the moment it first becomes available, reads as fine right up
  until a second entity of the same kind gets opened and the cached field
  doesn't follow it.
- A form whose field feeds a downstream rule (a fee, a discount, an
  eligibility, a permission) is verified past the save, since a field can
  persist correctly and still never be read by the rule it was built for.

### Changed

- Fixing every carrier a grep turns up stops short of fixing the class: the
  fix-in-flight guidance now asks for a canonical source repointed by every
  carrier, and a grep for that canonical source before a new derived
  predicate gets written at all.
- This repository is now the `qmw` plugin, not the ratchet plugin. shakedown
  merged in from its own repository, and the two skills that were `/ratchet:audit`
  and `/ratchet:add` are `/qmw:ratchet-audit` and `/qmw:ratchet-add`. One
  repository, one plugin, one release, and the tool name lives in the skill name
  rather than in the plugin name.

  What this costs, stated once: a tool can no longer be installed on its own, and
  the two tools no longer version separately. What it buys is one namespace at
  the prompt.

- The npm package is `@quietmachineworks/qmw`, and the runner it exposes moved to
  `skills/ratchet-add/scripts/ratchet.mjs`. A project that vendored the runner
  into `.ratchet/` is unaffected, which is the point of vendoring it.

### Fixed

- `scan.match` and a rule's `match` are tested against the repository-relative
  path in both modes. They previously saw the absolute path inside a git
  repository and the bare filename outside one, so a path-anchored pattern
  matched nothing in the first case and everything it should not in the second.

### Added

- `--update` refuses to freeze a rule with no `why`. The failure message is the
  invariant with the least natural pressure behind it, and a detector that
  counts correctly looks finished without one.
- Guidance on choosing `scan.dirs` and `scan.match`, the decision that fixes
  every number a rule reports and the one most often made by accident. A scope
  that misses extensionless files returns a smaller count, which reads as a
  cleaner repository.
- A step before freezing a large count: say which areas it comes from, and ask
  when part of the scope covers text the convention may not have been meant to
  reach. Size is not the question, endorsement across the scope is. A contested
  scope does not fail at freeze, it fails at the first red build, and it gets
  resolved by widening `skip` rather than by fixing the line.
- A small non-zero count is offered as a fix in the same pass and frozen at
  zero, rather than frozen as debt nobody chose to tolerate.

### Changed

- The add skill asks for the incident before writing the detector rather than
  after freezing, so the file is written once and no placeholder `why` reaches
  a commit.
- The add skill verifies that git holds the installed check, looks for an
  earlier installation before writing one, and reads a workflow's triggers
  before adding a step to it.
- The audit skill reports the globs a count was measured with, so a zero can be
  told apart from a scope that missed half the repository.
- The audit report ends on the actions worth taking, written to be pasted,
  instead of on candidates the reader has to translate back into commands
  themselves. Last rather than first: a terminal keeps the end of the output on
  the screen, next to the prompt, while the beginning has scrolled away. A
  `/qmw:ratchet-add` is one kind of action: switching on a check the project
  already configured costs a line, enforces a rule that is written and inert,
  and outranks any new ratchet.
- A measurement command that came out broken may be run again. The one-command
  budget was written against refinement passes, and a run read it as forbidding
  repair, shipping a count that had lost its breakdown rather than rerunning a
  command whose flags had cancelled each other.
- The one-command budget covers the counting pass, not finding out what already
  runs. Inspecting the enforcement configuration is reading, whether the file
  is opened or the shell is asked.
- A candidate blocked on a scope decision is reported with both branches
  priced. The breakdown by area is already measured, so the arithmetic is free,
  and it turns a question into a choice the reader can make in one read.
- A rule that cannot be satisfied as written is an action to correct it, not a
  candidate with a count. An `.editorconfig` demanding tabs for YAML, which
  forbids tabs, cannot be complied with, and freezing it would bless the
  violation permanently.
- The deviation line prints nothing when there is no deviation, not even
  `deviated: none`. A line that appears every run stops being read, and the one
  that matters gets skipped with it.
- One closing action is one invocation for one rule. A line whose command names
  one rule and whose reason sells three is a batch in disguise: the reader
  pastes it and gets one, while the block claims three actions and proposes
  five rules.
- A check that exists and never runs is reported with a `gap` line rather than
  a count. Its zero means no workflow invokes it, the worst result available,
  while every other zero in the report means no violations, the best one.
- Counts overlapping a check the project already carries name the overlap. On a
  repository holding its own ratchets a raw total reads as unguarded when most
  of it is frozen, and only the remainder is a gap.
- CI is wired per rule, as the rule lands, instead of once at the end for all
  of them. There is no end when each rule arrives in its own invocation, and a
  rule frozen and committed but never wired is the same absent check as one
  never committed.
- `add` closes by naming the next action from the audit that produced it, one
  line, without starting it. There is deliberately no batch mode: building
  several rules at once removes the incident question, which is the step that
  decides whether a rule survives its first inconvenient failure.
- Both skills close on one line per deviation from their own budget, and on
  nothing at all when there is none. Only countable things qualify: commands
  against the budget, files written against none, the frozen total against the
  count the regime was chosen on. It is a line in a terminal, not a file and
  not an issue.
- A candidate whose scope is unsettled carries its blocker in the closing
  action itself. What breaks a report is distance: a free freeze recommended
  on one screen while the note calling the zero an artefact sits two screens
  away is a contradiction the reader never assembles.
- The audit's `write nothing` covers the host project's own bookkeeping. A
  repository whose protocol asks every session to journal is addressing the
  agent, not this skill, and an audit that leaves a line behind can no longer
  be run on a repository you do not own.
- The audit report is bounded: the measurement scope is stated once for the
  pass rather than under every candidate, pile 3 is one line per rule with no
  narrowing analysis, unstated suggestions are capped at three, and the whole
  thing fits on two screens.
- A tool configured but never run counts as unenforced. A rule at `error` in a
  linter no workflow invokes is a rule nobody applies with a file claiming
  otherwise, and wiring it costs less than any ratchet placed beside it.

## [0.1.0]

First release.

### Added

- Generic runner supporting several rules per definition, a regime per rule
  (frozen or gate), a per-rule file filter, escapes judged against the matched
  line, and a commit surface with a start date.
- Skill that reads a project's existing conventions, sorts them into already
  enforced, mechanizable but unenforced, and not mechanizable, then builds
  checks for the ones chosen.
- References covering detector authoring, the invariants, and CI wiring.
- Two example definitions, kept as illustrations of the format.

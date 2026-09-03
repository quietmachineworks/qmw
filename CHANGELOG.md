# Changelog

All notable changes to this project are documented here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and
this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- New command: `/qmw:help`, the fleet and the moment each skill belongs to,
  grouped by when you reach for it rather than alphabetically. A command and
  not a skill on purpose: a skill pays its description on every prompt of
  every session, and this one would spend that toll to repeat what the agent
  already carries. CI now reads the map too, so a skill added without a line
  there fails the build rather than going unmentioned.

## [0.4.0] - 2026-09-03

### Added

- New skill: `manifest`, the audit turned on the agent rather than the code.
  The installed skills, commands, subagents, hooks, MCP servers and plugins
  inventoried from the config that is actually there, then priced on what
  each costs whether or not it fires - standing cost paid on every prompt,
  per-call cost paid on every matching tool call, per-session cost paid at
  connection - against what the session transcripts show it earned, each
  count carrying the window it was measured over. Reports shadowing, where
  two descriptions claim the same trigger and the loser never fires and
  looks dormant. `find` compares what is aboard against what the ecosystem
  offers on fit, real cost and trust, and offers writing the three lines
  yourself as a verdict; it installs nothing. `clean` strikes one approved
  item at a time, removing only what a registry can restore and archiving
  what exists nowhere else, config backed up first. Audit and find write
  nothing; silence is never approval.

## [0.3.0] - 2026-08-25

### Added

- New skill: `refit`, the yard work that follows the survey. One finding at a
  time - a block from a `/qmw:survey` report, or a defect class named
  directly - re-verified against the tree, its carriers enumerated by
  predicate, current behavior pinned before anything moves (the project's
  gate, plus characterization tests where the touched code has none), the
  class closed rather than the sites patched, and proof that nothing
  observable changed: the pin replayed, the count re-measured to zero,
  touched screens walked in a browser, a fresh-eyed sub-agent judging the
  diff against the mandate alone. One intervention, one commit, one entry in
  `.refit/log.md`. A bug discovered mid-repair is handed off, never silently
  corrected inside a restructuring commit.
- New skill: `drydock`, dependencies raised one proven step at a time. The
  yard list built from every manifest the repository carries and priced;
  advisories first, majors alone so a regression bisects to one name,
  version-locked families moved together, minors batched under the gate.
  Each raise is read before it happens - the real release notes, intersected
  with actual usage in the code - and proven after: clean install, build,
  gate. What cannot be raised cleanly is reverted and held with the price of
  unblocking it in `.drydock/log.md`, and every commit left behind is a tree
  where install, build and gate pass.
- New skill: `seatrial`, the release checklist executed rather than read.
  The current commit built from a clean clone, the artifact that would ship
  opened and inspected both ways, migrations played forward from the last
  released state rather than the dev database, changelog and version bump
  judged against the actual diff since the last tag, the built product
  smoked the way production starts it. Ends on a go or no-go bound to one
  commit; any change to the tree voids the verdict and the trial runs again.
  Fixes nothing, writes nothing.

## [0.2.0] - 2026-08-25

### Added

- New skill: `survey`, a whole-codebase audit in the spirit of a marine
  survey: the entire vessel or the perimeters you pick (front, back, mobile,
  infra), walked under nine lenses - design, duplication and reinvention,
  over-engineering, superseded patterns, dead weight, inconsistency, boundary
  hygiene, performance shapes, test debt. Everything is judged against the
  stack the project actually runs and the conventions it wrote down, never
  the zeitgeist. Findings are classes with evidence and a priced fix
  direction, capped so the structural ones survive the scroll. Reports and
  prioritizes, fixes nothing, writes nothing.
- New skill: `squawk`, one reported bug run from incident to proven fix. The
  report gets logged verbatim before anything else, reproduced in a real
  browser before any code changes, fixed at the class rather than the sites,
  then proven the way it was found: the reporter's path replayed from a clean
  session, held to four axes (functional, visual, UX, UI at every declared
  viewport) and signed off by fresh eyes that never saw the fix. Standalone:
  it shares shakedown's standard of proof and none of its files.
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

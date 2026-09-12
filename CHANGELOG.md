# Changelog

All notable changes to this project are documented here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and
this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- `evals/refactor-proves-nothing-moved`: the first case on the repair half of
  the line. A fixture with three copies of `formatDate`, two cited by the
  finding and one not, two of them pinned by tests and one not, and a `.qmw/`
  that already carries the gate. Five graders, four of them mechanical: the
  skill fired, a sub-agent ran, an edit precedes that sub-agent, and
  `.qmw/refactor/log.md` carries the `RF-2` entry. The fifth is judged from the
  reply and asks two things the discipline cannot do without: the carrier the
  finding did not cite was found, and the gate was green before the first edit
  and again after the work. No grader requires the commit itself, since `git`
  can be unusable inside the eval sandbox.

  The shape of the judged half is what six runs taught. A rubric of six
  conditions and five failure clauses fails replies that satisfy every one of
  them: three judges share one prompt, so a single misreading becomes a
  unanimous verdict, and the run is scored against nothing real. What a judge
  holds reliably here is a couple of unmistakable facts; everything structural
  belongs in a mechanical grader, where the verdict carries its own evidence
  (`Edit@15 precedes Agent@22`). The closing shape of a reply was graded and
  then dropped for that reason, not because the skill failed it.
- The documented eval command passes `--allow-tools Bash Write Edit`, which the
  repair cases need and the audit cases are indifferent to.

### Removed

- `.github/workflows/evals.yml`. It read `ANTHROPIC_API_KEY` from repository
  secrets, the repository has none, and a dispatch nobody can dispatch is a
  claim the repository does not back. The evals run on the maintainer's
  machine, and `evals/README.md` now says so, with the local obstacle that
  costs an afternoon the first time: a case granting `Bash` refuses to start
  while a credential store holds a symbolic link inside it, which on macOS
  with Docker Desktop is always.

## [0.8.0] - 2026-09-12

### Fixed

- `examples/comment-norms.mjs` imported the helper from the skill's pre-0.7.0
  path and loaded on nobody's machine. The path is corrected, and the repo
  check now imports every example.
- A definition holding only gates could not be verified until `--update` had
  been run once, contrary to what the references promised. A gate-only
  definition now verifies with no baseline and `--update` on it writes nothing.
- A `scan.match` written with the `g` flag alternated between hit and miss
  across files and froze half the repository as the whole of it. Path filters
  and escapes are now tested with `search`, which ignores the flag.
- A `detect` written without the `g` flag counted the match and its capture
  groups as separate hits. A non-global match result is now one hit.
- A dangling symlink crashed the filesystem walk used outside git; it is now
  skipped. A definition missing `rules`, `scan`, a `detect` function or a valid
  `regime` produced a stack trace; it now exits 2 naming the field.
- The plugin and marketplace descriptions, one line of the README and the
  contributing, security and issue files still described the pre-0.7.0
  toolkit. Rewritten for what the repository is now.
- The README, METHOD and full-cycle text claimed a command's description is not
  paid on every prompt while a skill's is. Commands and skills are one thing
  in Claude Code and both pay; the claim is gone, and the mechanism that does
  keep a heavy workflow out of the agent's hands is declared instead.

### Changed

- `help` and `full-cycle` moved from `commands/` to `skills/`, which is where
  the runtime now wants them, each with `disable-model-invocation: true`.
- The audit skills (`audit-rules`, `audit-codebase`, `check-release`, `status`)
  declare `disallowed-tools: Write, Edit, NotebookEdit`, so "writes nothing"
  is held by the harness for the turn and not only by the text. `run-qa`,
  `fix-bug`, `upgrade-deps` and `build-feature` declare
  `disable-model-invocation: true`. `freeze-rule`, `refactor`, `build-feature`
  and `fix-bug` carry an `argument-hint`. `build-feature`'s description is
  shorter, same triggers.
- The reference on wiring CI no longer offers an npm dependency on the runner:
  there is no published package, and vendoring is the only path.

### Added

- `test/repo.mjs`: manifests parse and agree, one version across
  `package.json`, `plugin.json` and the changelog, every skill named and
  described under the length the runtime truncates at, audit skills disallow
  the write tools, every `/qmw:` reference and every relative markdown link
  resolves, the vendored runner matches the shipped one, the examples load.
  CI runs it, alongside `claude plugin validate --strict`.
- `.ratchet/` on this repository: a gate on em dashes, on the pre-0.7.0
  names outside the changelog, and on assistant attribution in files and
  commit trailers, plus a TODO ratchet frozen at zero. A `commit-msg` hook
  under `.githooks/` runs the commit rules as the message is written.
- `evals/`: four behavioral cases in the `claude plugin eval` layout, one per
  audit skill asserting the skill fired and nothing was written, one on
  `freeze-rule` asserting it measures and asks for the incident before writing
  a detector. Run on dispatch by `.github/workflows/evals.yml`.
- `.github/workflows/release.yml`: a `v*` tag publishes its changelog section
  as the GitHub release, and refuses a tag the manifests or the changelog do
  not carry.

## [0.7.0] - 2026-09-12

### Changed

- Renamed the whole toolkit from the nautical scheme to descriptive, dev-legible
  handles, and dropped the nautical metaphor from the prose: `survey` is
  `audit-codebase`, `refit` is `refactor`, `drydock` is `upgrade-deps`,
  `shakedown` is `run-qa`, `squawk` is `fix-bug`, `seatrial` is `check-release`,
  `manifest` is `audit-agent`, `ratchet-audit` is `audit-rules`, `ratchet-add`
  is `freeze-rule`, and the composed passage `haulout` is `full-cycle`. The
  handles now carry the audit-or-repair split in their verbs. State directories
  move with them (`.qmw/refactor/`, `.qmw/fix-bug/`, `.qmw/run-qa/`,
  `.qmw/upgrade-deps/`), with no compatibility for the earlier `.qmw/<old>/`
  layout. `audit-agent`'s cost verdicts `freight` and `ballast` are now
  `overhead` and `deadweight`.

### Added

- New skill: `build-feature`, the forward twin of `refactor`. Refactor changes
  structure and proves nothing observable moved; this adds behavior and proves
  the one intended thing landed, and nothing else did. One intention per run,
  its finish line written before the first edit, the surfaces that must not move
  pinned first, the intention played through until it lands (in a browser for a
  front end, at every declared breakpoint), a regression test at the level the
  behavior lives, and fresh eyes on the diff judging both that the intention
  landed and that nothing held has moved. One commit, one entry in
  `.qmw/build-feature/log.md`. A bug found mid-build is handed to `fix-bug`,
  never folded in. Narrow and proof-centric on purpose: not a planning tool,
  not a substitute for the base tools that write routine code.
- New skill: `status`, qmw's records read back. Where the working skills touch
  code and `audit-agent` audits the agent, this reads what qmw left under
  `.qmw/` and reports where the work stands: the bugs still open, the changes
  landed and the next one they named, the dependencies held with the price of
  unblocking each, the last release verdict. Details what needs a decision,
  lists the rest, closes on the record's own next step handed back as an
  invocation. Reads the records, never re-runs the skills; writes nothing.
- New command: `/qmw:full-cycle`, the full review cycle in one guided passage.
  Audit-codebase, then a refactor per finding the owner picks, upgrade-deps, a
  run-qa, and a check-release that ends on a go or no-go for the tag. It
  orchestrates and gates; it does not do the work itself, never softens a
  skill's discipline to keep moving, and never skips the gate between legs,
  where silence is not approval. A command and not a skill, the same reason
  `/qmw:help` is.
- `METHOD.md`, the connective tissue the individual `SKILL.md` files cannot
  carry because each has to run alone: the two disciplines (audit writes
  nothing, repair proves it did), the order the skills feed each other in drawn
  as one graph, the shared `.qmw/` state root, and the three roles they
  delegate into (executor, controller, fresh eyes).

## [0.6.0] - 2026-09-03

### Changed

- The fleet keeps its state under one root. `shakedown`, `squawk`, `refit` and
  `drydock` had each grown a private dot-directory at the repository top, five
  siblings with no way for any skill to find what another left: `refit` was
  reduced to hardcoding two of them to locate a gate someone else had already
  established and confirmed. They now resolve under `.qmw/<skill>/`, and a
  project set up before the convention has its bare `.squawk/` or
  `.shakedown/` read as a fallback, so nothing already in the field breaks.
  `.ratchet/` is untouched: it is a runner path with tests on it, not a log.
- `survey` reads a fourth thing before judging anything: the fleet's own
  record. A class `refit` already closed is not a finding, and a dependency
  `drydock` recorded as held with the price of unblocking it already sized is
  one line citing that hold rather than a rediscovered currency finding. It
  still writes nothing there - it reads so the report stops handing back work
  the yard has already done.
- Descriptions cut by a quarter across the fleet, ~1,070 to ~810 tokens of
  standing cost. Every one of them opened with an enumeration of what the
  skill does internally, which never helps the model choose between skills
  and is re-read on every prompt of every session. The triggers, which are
  the half that does the choosing, are kept word for word.

### Fixed

- `manifest` no longer calls a managed skill set hand-written. It priced forty
  skills as unversioned local work and prescribed archiving over removal, when
  every one of them carried its upstream source, path and hash in a skill
  manager's lockfile and was reinstallable in one command. It now looks for
  that record before assigning the unrecoverable class, and reaches for the
  owning manager's own removal instead of `rm` on a symlink, which strips the
  link and leaves the lockfile claiming an item that is gone.
- `manifest` knows that the agent's skill folder may hold nothing but links.
  Its inventory now looks for a skill manager's lockfile, which is also the
  only thing that explains a directory of agent folders for tools the machine
  has never had: one install told to target every agent creates them all.
  `find` searches that manager's registry alongside the registered
  marketplaces, before reaching for the open web.

## [0.5.0] - 2026-09-03

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

[Unreleased]: https://github.com/quietmachineworks/qmw/compare/v0.8.0...HEAD
[0.8.0]: https://github.com/quietmachineworks/qmw/compare/v0.7.0...v0.8.0
[0.7.0]: https://github.com/quietmachineworks/qmw/compare/v0.6.0...v0.7.0
[0.6.0]: https://github.com/quietmachineworks/qmw/compare/v0.5.0...v0.6.0
[0.5.0]: https://github.com/quietmachineworks/qmw/compare/v0.4.0...v0.5.0
[0.4.0]: https://github.com/quietmachineworks/qmw/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/quietmachineworks/qmw/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/quietmachineworks/qmw/releases/tag/v0.2.0

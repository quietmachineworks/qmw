---
name: audit-rules
description: Report which of a project's stated code rules are actually enforced, and which could be. Use when asked which conventions are enforced, whether a rule is respected, what the CLAUDE.md or AGENTS.md rules are worth, or to review the gap between what a project says and what it checks. Read-only, writes nothing.
license: MIT
---

# Audit rules

Most projects have written their conventions down and enforce almost none of them. This reports the gap.

**Write nothing.** No files, no config, no CI. The output is a list. Building is `/qmw:freeze-rule`, and it is the user's call, one rule at a time.

This holds against the host project's own bookkeeping, which is where it actually gets broken. A repository whose protocol asks every session to journal into a memory, context or session file is addressing the agent, not this skill. An audit that leaves a line behind is no longer something you can run on a repository you do not own, and the description promising it writes nothing becomes false. If the protocol wants a record, say what the line would be and let the user add it.

## Read what the project states

Read these, and stop there:

- `CLAUDE.md`, `AGENTS.md`, `GEMINI.md`, and any other host instruction file
- `.claude/rules/`, `.cursor/rules/`, or an equivalent directory
- `CONTRIBUTING.md`
- the user's global instruction file, if the project inherits from one
- a file under `docs/` only when its name says it is a convention: `STYLE`, `CONVENTIONS`, `CODING`, `GUIDELINES`

**Do not read `docs/` wholesale.** Architecture decision records, design notes and specifications describe why the system is shaped as it is. They are long, they are not rules, and reading twenty of them to find none is how this skill wastes its time. A rule is something a diff could violate.

If a rules file is over a few hundred lines, read it and move on rather than chasing every document it cites.

## Know what is already covered

Read the lint, format and type configuration before judging anything: `eslint.config.*`, `.eslintrc*`, `biome.json`, `.prettierrc*`, `tsconfig.json`, `ruff.toml`, `.editorconfig`, and any CI workflow that runs checks.

A rule already enforced there needs nothing. Proposing a ratchet for it creates a second place to change one rule, and the two will disagree within a year.

Look for checks the project wrote itself too: `.ratchet/rules/`, a `scripts/check-*` family, a `.semgrep/` directory. A repository that already carries them is the case where a raw count misleads most, because part of the occurrences are frozen and only the remainder is a gap. **Say which existing check covers part of a count**, and that the actionable figure is the uncovered part. "26 in scope, an unknown share already frozen by the existing ratchet, the rest under `scripts/` and `.github/`" is a finding. A bare 26 reads as 26 unguarded.

Their scopes are in their definitions and cost one read. Splitting the count exactly costs a second measurement pass, which the budget does not allow, so name the overlap rather than resolving it.

## Sort into three piles

**1. Already enforced.** Name the rule and the tool that covers it. One line each.

Configured is not enforced. A linter carrying the rule at `error` that no workflow runs, or a workflow whose triggers skip the branch people actually push to, is a rule nobody applies with a file that says otherwise. That belongs in pile 2, with a note saying the check exists and does not run. Wiring it is cheaper than any ratchet and it is usually the first thing worth reporting: a project whose stated commands are never executed gains more from running them than from a new check beside them.

**2. Mechanizable but unenforced.** The candidates. For each, three things and no more:

- the rule in one verifiable sentence
- **where it is stated**, with the file and the wording it comes from
- a rough count

A candidate must come from something the project wrote down. If you know a convention the stack usually follows and this project never stated it, that is a suggestion, not a finding: put it in a clearly separate list at the end, so the reader can tell what they already decided from what is being proposed to them.

**A rule that cannot be satisfied as written is not a candidate.** An `.editorconfig` demanding tab indentation for YAML, which forbids tabs, is a rule to correct, not a rule to check. So is a rule the project contradicts elsewhere in its own configuration. Building a detector for it would enforce something nobody can comply with, and freezing it at its current count would bless the violation permanently. It goes in the closing actions as one line saying which file to fix, and never in this pile with a count beside it.

**3. Not mechanizable.** Judgment calls: "keep functions readable", "do not over-abstract", "write meaningful names". Say so plainly. A detector that approximates a judgment call produces false positives, and a check that cries wolf gets disabled within a month, taking the honest checks with it.

Before filing a rule under 3, try narrowing it. "No over-abstraction" is not detectable; "no single-use factory" might be. Report the narrowed version as a candidate and say what it drops.

## Measuring the counts

**You get one measurement command.** Not one per rule, not one then a refinement. One. Write it once, with every pattern in it.

**A command that came out broken may be run again.** A flag that cancelled another, an empty result from a path that does not exist, output in a shape you cannot read: running it once more is repair, not refinement. Shipping a degraded number to respect a budget is the wrong trade, and the budget was written against a second pass over a number that came out correctly, to narrow it, split it or tidy it.

If you do ship a degraded count, say so in the deviation line and say what it costs the report. A count that lost its breakdown cannot price the branches of a scope decision, and the action that rested on it turns back into a question.

```bash
git ls-files '*.ts' '*.tsx' '*.vue' '*.js' '*.mjs' \
  | grep -vE '^(\.claude|\.cache|dist|build|vendor|coverage)/' \
  | tr '\n' '\0' \
  | xargs -0 grep -oh -e 'PATTERN_ONE' -e 'PATTERN_TWO' -e 'PATTERN_THREE' 2>/dev/null \
  | sort | uniq -c
```

One line per pattern with its count. Add patterns, never invocations.

`git ls-files` is the cheapest correct file list: it excludes `node_modules`, build output and everything ignored, without a traversal. A `grep -r` from the project root walks dependencies instead, hundreds of megabytes, once per rule.

**Always pass extension globs.** A bare `git ls-files` returns spreadsheets, images, lockfiles and agent state directories, and then you spend a second pass filtering them back out.

Rules that only apply to a subset narrow the glob: `'*.spec.ts'` for a test convention, `'src/**'` for application code. Decide the globs before running, since you only get the one run.

**The glob list is part of the finding, so report it.** A rule about text a human wrote applies to `Makefile`, `Caddyfile`, `.env.example` and `.webmanifest` as much as to a component, and no `*.ext` list contains them. The count that comes back is not the project's count, it is the count within the globs you chose, and the difference is invisible to the reader unless you name them.

`/qmw:freeze-rule` will measure again with a scope written for the rule, and that number will differ. Saying which globs produced this one is what lets the user see the two as the same finding rather than as a contradiction.

**A rule about file names costs nothing to count.** `git ls-files` prints every path before `xargs` ever opens a file, so a naming convention is a `grep -cE` on that list, in the same invocation, separated by `;`. One shell call may hold a second pipeline when that pipeline measures names instead of contents. Reporting a naming rule as *count unknown* when the paths were already on stdout leaves a free number on the table.

**Never read source files to count.** Reading is for the rules, counting is for the shell.

### A count is not a proof, and does not need to be

An occurrence count is not a violation count. `useFetch(` appears forty times; how many lack a key is a different question, and answering it means writing the detector.

**Do not answer it here.** If a candidate cannot be counted by a single pattern in the one pass, report it as *needs a detector, count unknown* and move on. That is a complete answer: the rule is real, mechanizable with work, and not free.

Report an ambiguous count as ambiguous. *"Forty-one, of which an unknown share sit in generated files"* is a finding. Running another pass to split it is not: which paths a rule covers is `scan.dirs` in the detector, and that belongs to `/qmw:freeze-rule`.

Signs you have left the audit and started building:

- a second or third measurement command, whatever it is for
- `grep -A`, `grep -B`, `-n`, or reading matched lines
- checking whether a given occurrence is really a violation
- opening a source file to see surrounding code
- narrowing paths to make a number cleaner

Any of these means stop and report what you have.

An approximate count is fine and should be labelled as such. Off by ten percent still tells the user whether they face debt or a clean slate, which is the only decision this report supports.

## Keep it cheap

This is a report, not an investigation. Its whole budget:

- a handful of file reads, for the rules
- **one** measurement command
- then write the answer

Inspecting the enforcement configuration is reading, whether you open the file or ask the shell whether a workflow mentions a script. The one-command budget is on the counting pass, not on finding out what already runs, and a run that reports four config inspections as a deviation is reporting the wrong thing.

Nothing in this report justifies a second pass. A number you would like to be cleaner is reported as it is, with the reason it is not.

If a project states no rules, say so immediately instead of hunting for implicit ones.

## Report

Write the report in the language of the conversation. It is read now, by the person who asked, and nothing of it lands in the repository.

### The piles

**No tables.** This is read in a terminal, often eighty columns wide. A three-column table holding a rule, a source and a count wraps every cell, and a wrapped table is unreadable. Use a flat list, one candidate per block:

```
2. A widget never calls the frobnicator directly
   stated  CONTRIBUTING.md, section 4
   count   12 outside vendor/ (140 inside, exempt)
```

That rule is nonsense on purpose, and every example in this file is built the
same way. A worked example naming a plausible convention becomes a template: the
run reports the rule it was shown, sourced to the file the example cited, with
the reason the example gave, and nobody can tell it apart from a candidate the
project actually stated. **Generic is not inert.** `no console.log`, `no TODO`,
`no em dash` are written down in half the repositories that exist, so an example
using one of them is indistinguishable from a finding. Only a rule that cannot
appear in a real project is safe to demonstrate with. Same for paths, which is
why no example here names a directory belonging to one repository.

**A check that exists and does not run carries a `gap` line, never a `count`.** Its zero means no workflow invokes it, which is the worst result available; every other zero in the report means no violations, which is the best. The same field cannot carry both, and a reader skimming counts will read the good one:

```
1. API integration tests run in CI when apps/api is touched
   stated  CLAUDE.md, section 6
   gap     no workflow contains test:integration
```

State the measurement scope **once**, under the pile 2 heading, since one command produced every count. A candidate carries its own `scope` line only where it differs. The same globs repeated under nine candidates are nine lines that say nothing, and they bury the two that do.

**Pile 3 is one line per rule.** No narrowing analysis, no account of why the detector would be wrong. A narrowing that succeeded is already a candidate in pile 2; a narrowing that failed is work you did, not a finding. The reader asked which rules can be checked, and this pile answers "not this one".

**Suggestions the project never stated: three at most, one line each**, under their own heading so nobody mistakes them for existing policy. They are the least valuable part of the report, since nobody asked for them.

### Length

The whole report fits on two screens. When it does not, the cut comes out of pile 3 and the suggestions, never out of the counts.

**Pile 2 details six candidates at most.** Past that the cut comes out of pile 2 as well, and it takes the form of one closing line carrying the rest as a name and a count each: *and 4 more: gizmo serial numbers 0, widget naming 0, sprocket alignment 2, frobnicator timeout unknown*. Twelve blocks of three lines is a wall and the reader stops at the fourth, which loses the ones that mattered along with the ones that did not. A named rule can be asked about; a rule buried at position eleven cannot.

**A name and a number, nothing else.** No parenthesis explaining why a count is unknown, no note on what the detector would need: that is the detail treatment, and a line carrying it four times over is the wall again in one paragraph. `unknown` is a complete answer here, and the reader who wants the reason asks for that rule.

Detail the ones a decision or a cost hangs on: a check that exists and does not run, a count large enough to need a scope call, a rule whose violation ships to production. A count of 1 with nothing to decide is a name on the closing line.

Two observations worth making when they apply, because they change what the user should do next:

- **A candidate whose count is zero.** The rule is already respected. Freezing it at zero enforces it as strictly as a hard ban would, for nothing. These are the cheapest wins in the list, and they are the ones a narrow glob list fabricates: a scope that misses half the repository returns zero just as convincingly as a clean repository does. Report a zero with the scope that produced it, always.

- **A rule the project believes it already enforces.** Notes, memory files and past session records sometimes describe checks that are not in the tree. Verify against `git ls-files` and the CI configuration rather than against what the project says about itself, and report the gap first: a check believed to exist is worse than a missing one, because nobody is looking for it.
- **Nothing mechanizable at all.** Some instruction files are entirely behavioural guidance, and every rule lands in pile 3. Say it: the project's conventions are a matter of review, not of tooling, and no ratchet will change that.

Name the candidates that need a decision before they need a detector. A large count is not a reason to hold back, since freezing high still blocks the next occurrence. An undecided scope is: when a chunk of the count sits in prose, generated files or vendored text the convention may never have been meant to reach, the check gets built on a boundary nobody drew, and the first red build is resolved by widening the exclusions.

**Price both branches.** The breakdown by area is already measured, so the arithmetic is free: "including the docs freezes 1600 and guards only the code, restricting it to `src/` and `tests/` freezes 885 and leaves the prose alone". That turns a question the reader has to think about into a choice they can make in one read, and it costs no second pass.

### Close on what to do

**The last thing printed is the action**, written so it can be pasted:

```
--max-warnings 0 on the lint script
   43 warnings today under a rule the project already set to error.
   The rule is written and does not guard the door.

/qmw:freeze-rule a widget never calls the frobnicator directly
   0 today, so freezing costs nothing and holds as hard as a ban

/qmw:freeze-rule every gizmo carries a serial number
   22 today, enough to freeze. Decide first whether the documentation
   counts, see pile 2.
```

**Nothing comes after the actions.** No summary, no closing analysis, no highlighted box of insights. The screen has one slot next to the prompt and the actions own it; anything printed below them takes it, and what takes it is usually pile 2 restated in prose, which the reader already scrolled past once.

Last, not first. A report is read in a terminal, where the end of the output is what stays on the screen and the beginning has already scrolled away. A document leads with its conclusion because the reader's eye starts at the top; here it starts at the bottom, next to the prompt they are about to type into. The piles are the argument, and the actions fall out of them.

**A `/qmw:freeze-rule` is one kind of action, not the only one.** Turning on a check the project already configured, or running in CI a command it already names, costs one line and enforces a rule that is written down and inert. That outranks every new ratchet, even though this pack gains nothing from it. A report that only ever proposes its own tool is selling, not auditing.

Write the argument the way `/qmw:freeze-rule` takes it: the rule in one sentence, in the project's own words. A candidate the reader has to translate back into an invocation is a candidate they will not run.

One line of reason each, and that reason is the count and what it implies, not the rule restated.

**A candidate whose scope is unsettled carries the blocker on its own lines here**, as the third example does. What breaks the report is distance, not co-presence: a free freeze recommended here while a note two screens up says the zero may be an artefact of the globs is a contradiction the reader will not assemble. Naming the decision next to the command is honest and still actionable.

**One line, one invocation, one rule.** A line whose command names one rule and whose reason sells three is a batch in disguise: whoever pastes it gets one, and the block claims three actions while proposing five rules. When several rules are free to freeze, pick the one worth doing first and leave the others in pile 2, where the reader can find them after the first has landed. `add` closes by naming the next one anyway.

Two or three actions in total, never the whole list. A project that gains eight checks in an afternoon deletes them all within a month.

## Say where the run broke its own budget

One line per deviation, and only when there is one. It goes after the piles and **before the closing actions**, so the last thing on the screen stays what to do:

```
deviated: 4 measurement commands, this skill allows 1
deviated: wrote the project's session log, this skill writes nothing
deviated: 5 screens, this skill fits on 2
```

**Nothing to say is the normal case, and then print nothing at all.** Not a summary, not `deviated: none`. A line that appears on every run stops being read, and then the one that matters gets skipped along with it. Compliance is already visible without being claimed: the scope line shows the pass that ran, and a report that wrote nothing shows it by having written nothing.

Only what can be counted belongs here: commands run against the budget, files written against none, candidates reported without a scope, screens against two. Not "the report ran long", not "the counts could be sharper". A judgment on your own run is worth little, because the run that drifts is the one least able to see it.

This exists because the gaps in this skill were found by holding a run against the text it was meant to follow. A run that says where it did not match saves the next reader from doing that by hand. It is a line in a terminal, nothing more: no file, no issue, no report sent anywhere.

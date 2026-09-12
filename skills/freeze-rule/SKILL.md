---
name: freeze-rule
description: Build a check that enforces a code rule, as a ratchet that freezes existing violations and fails on a rise, or as a gate that tolerates none. Use when the user says they no longer want something in a codebase, that a rule is never respected, that a mistake keeps coming back, or asks to prevent a regression, freeze technical debt, ban a pattern, or enforce a convention. Takes the rule as an argument.
license: MIT
---

# Freeze rule

Build the check for one rule: `$ARGUMENTS`

If no rule was given, ask for one. To find candidates instead, `/qmw:audit-rules` lists what a project states and never enforces.

Several rules can be built in one session, but finish each before starting the next, and stop between them for the user to confirm. Each costs a CI step and a baseline, and the step that gets skipped when they run together is asking what incident the rule came from, which is the one that decides whether the rule survives.

## Which project

The runner scans the current working directory. Confirm it is the repository the rule is for before writing anything: a session started elsewhere, or one that arrives from `/qmw:audit-rules` run against another checkout, will otherwise install the check in the wrong tree.

## 1. State the rule in one verifiable sentence

If it does not survive that, it is a judgment call. "Keep functions readable", "do not over-abstract", "write meaningful names": a detector that approximates these produces false positives, and a check that cries wolf gets disabled within a month, taking the honest checks with it.

Try narrowing first. "No over-abstraction" is not detectable; "no single-use factory" might be. If nothing survives, say the rule stays a matter of review and stop.

## 2. Decide the scope, then measure

The scope is `scan.dirs` and `scan.match`, and it is the decision that fixes every number after it. Settle it here rather than at step 4, so the count the user chooses a regime on is the count that gets frozen. See `references/writing.md`, "Choosing the scope".

Deciding it needs an inventory of what the repository actually holds, and **that inventory is part of the measurement, not a detour**: one pass listing tracked paths by extension, then one pass counting. Two commands, no more.

For a commit-message rule, do not count history at all. `since` is the moment you add the rule, so what came before is out of scope by construction.

**Is every occurrence a defect, or is there acceptable existing debt?**

- **Gate**, `regime: 'gate'`, when every occurrence is a production defect. Nothing tolerated, no baseline. The case to keep in mind: a missing icon in a subsetted font renders an empty square on a user's screen, and no typecheck, test or console error catches it. There is nothing to freeze.
- **Ratchet**, `regime: 'ratchet'`, when the debt is real, numerous, and breaking nothing today. Banning it outright would mean fixing every case before the check can be turned on, so it never is.

Choosing a gate where a ratchet belongs produces a check nobody can turn on. Choosing a ratchet where a gate belongs quietly blesses defects.

**If the count is zero, use a ratchet anyway.** Frozen at zero it enforces exactly what a gate would, and it stays adoptable if the count later turns out to be non-zero somewhere you did not scan.

A count of zero deserves one moment of suspicion before it becomes a decision: it is the result a scope that is too narrow produces just as reliably as a clean repository. Say what the scope was when reporting it.

**If the count is small enough to fix now, fix it and freeze at zero.** Two occurrences frozen as debt are two occurrences blessed for good, and the baseline then records a tolerance nobody chose. Offer the correction in the same pass and freeze what is left. The threshold is not a number, it is whether the fix fits in the pass that is already open.

### Before freezing a large count

Grandfathering is the mechanism, not a compromise. A ratchet frozen at seven hundred blocks the seven hundred and first, and a total that never falls is still a rule doing its work. Invariant 5 exists so adoption costs nothing on day one, and a large baseline is what that looks like. Do not talk a user out of one, and do not apologise for the number.

What deserves a question is not the size of the count, it is whether the convention is endorsed everywhere the scope reaches. A count is large for two unrelated reasons: real debt in code under active work, or a scope that has wandered into text the rule was never meant to cover. The second does not fail at freeze. It fails the first time CI goes red, when whoever trips it does not believe the rule applies to the file they touched and resolves it by widening `skip` or deleting the step, taking the honest checks with it.

So when the count is large, say what it is made of before freezing: the two or three areas it comes from and their share, which the counting pass already gives you. If part of it sits somewhere the user has not decided the rule applies, ask. If they have decided, freeze it high and say the number plainly.

Three outcomes, and the choice is the user's, not yours:

- freeze the whole scope, when the convention covers all of it
- narrow the scope to what the convention actually covers, and freeze that
- leave the rule unbuilt, when what it covers has not been decided, and say what has to be decided first

## 3. Ask for the incident

**Do not skip this, and do not defer it.** Ask the user: *what happened that made this rule worth having?*

The answer goes into `why`, so it has to exist before the detector is written. Asking afterwards means writing the file twice, and the version that gets committed in between carries a placeholder that nobody comes back to. The runner refuses to freeze a rule with no `why` for that reason.

Write the consequence observed, not the rule restated. A message that says "this pattern is banned by our conventions" gets worked around. One that names what broke gets read and remembered. In six months whoever trips it did not write the rule and may not be human, and this message is the only thing left explaining why they should care.

If there is no incident yet, ask what the rule protects against and write that. If neither can be answered, say the rule may not be worth a check.

Fill `instead` too: what to do in place of the banned thing. A failure that only forbids leaves the reader stuck.

### Offer what the record supports, never what only they know

When you offer options, say which ones the record already backs, and with what. *"Frozen at zero, and the trailer is added by a tool that will do it again: a hundred and forty-one commits in eight days"* is a finding, and marking it as such saves the user from reconstructing your reasoning.

Never present an option claiming an incident as the likely one. Its whole content is a fact you cannot see, and dressing a guess as a recommendation is how a `why` ends up carrying your reconstruction under the user's endorsement, which is the exact failure this step exists to prevent.

So: annotate the options you can support, leave the others bare, and let the user pick. The distinction between what you verified and what you inferred is more useful to them than a recommendation.

## Language of what you write

Everything written into the project follows **the project's own convention**, not the language of this conversation: the definition's comments, `why`, `instead`, the CI step names, the hook messages.

Read what the repository does before writing. Its instruction file may state it, and its existing comments and commit subjects show it. A project whose rules file says one thing and whose recent commits do another has changed its mind, and the commits are the better evidence.

A failure message is read by whoever trips the check, in a CI log, months later, possibly by someone who never spoke to you. It belongs to the repository, not to the exchange that produced it.

This skill is written in English. What it generates need not be.

## 4. Write the detector

See `references/writing.md` for the format, the helpers, escapes, and the commit surface.

Keep the heuristic honest. A ratchet measures a direction, not an exact count, and the definition should say so in its own header, along with what its scope leaves out. A reader who discovers an undocumented blind spot stops trusting the whole check.

## 5. Install the runner in the project

Look for a previous installation first: `.ratchet/`, or a stray `ratchet.mjs` under `scripts/` from an earlier version. Report what you find rather than installing a second copy beside it.

Copy `scripts/ratchet.mjs` and `scripts/lib/source.mjs` from this skill into `.ratchet/` at the project root, and put the definition under `rules/`:

```
.ratchet/
  ratchet.mjs
  lib/source.mjs
  rules/
    <name>.mjs
    <name>-baseline.json
```

One directory, owned entirely by this tool, removable with a single `rm -rf`. Do not scatter these into an existing `scripts/`, which usually already holds unrelated things.

Vendor them rather than depending on this skill being installed. Two files, no dependencies, and the check keeps working when the skill is uninstalled, when CI runs without network, and when someone clones the repository years later.

A definition under `rules/` imports the helper as `../lib/source.mjs`.

## 6. Freeze, verify, commit

```bash
node .ratchet/ratchet.mjs <name> --update
node .ratchet/ratchet.mjs <name>
```

A bare name resolves to `.ratchet/rules/<name>.mjs`. The first freeze never fails. Say the number out loud: it is what tells the user whether they are looking at debt or at a clean slate, and it is often not what they expected. If it disagrees with the count from step 2, say so and say why.

Then commit the whole `.ratchet/` directory, baseline included, and **check that git actually holds it**:

```bash
git ls-files .ratchet
```

Four paths or nothing. An uncommitted ratchet is not a weaker ratchet, it is no ratchet at all: it passes locally, it does not exist in CI, and the only trace left is a session that reported success. This is the step that gets lost, and it is invisible when it does.

## Land each rule before starting the next

A rule that is written, frozen and committed is worth something on its own. Three rules that only work once the last one is wired are worth nothing until then, and anyone who stops halfway is left with a working tree full of files they did not ask for.

So, per rule: decide the scope, measure, ask, write, freeze, verify, commit, wire. Say the number and move on.

**Wire each rule as it lands.** Steps are appended to a workflow independently and a second one conflicts with nothing, while a rule frozen and committed but never wired is the same absent check as one never committed: a green pipeline with nothing running in it. Saving the workflow edit for the end assumes a session that builds several rules, and there is no end when each rule arrives in its own invocation.

Announce the plan in one line before starting, and report each rule as it lands. Someone watching should be able to stop after any rule and keep what came before.

**Name the next action, then stop.** When the rule came from an audit, close on the next line of its closing block, as one line. The user arrived with a list, and by now that list has scrolled off the screen; making them go back for line two is what turns three rules into one. Naming it is not starting it. Wait for them to invoke it.

There is no batch mode, and adding one would remove the incident question, which is the step that decides whether a rule survives its first inconvenient failure.

Report what git holds, not what you wrote. "Frozen at 772 and committed in `a1b2c3d`" is a report; "the ratchet is in place" is a claim the next session will believe and find false.

## Keep it moving

A rule takes a few minutes, not half an hour. The budget per rule:

- one command to inventory the scope, one to measure
- one question to the user
- one file written, once
- one freeze, one verify, one commit

What blows this up is establishing facts the rule does not need: the exact date of the last violation, how many of the occurrences are truly violations, which files they sit in. None of that changes the detector. Knowing which *kinds* of file exist does change it, which is why the inventory is in the budget and the forensics are not. If you find yourself proving something, stop and write the rule.

## 7. Wire CI

See `references/ci.md`. One step per ratchet, after lint and typecheck, before tests.

Check where the workflow actually runs before adding a step to it. A ratchet wired into a job that skips the default branch, or that only fires on pull requests in a repository people push to directly, is decoration. Say so rather than wiring it silently.

A rule about commit messages belongs in a `commit-msg` hook, where the author can still fix it in place, rather than only in CI where it is found after the fact. Use `--message "$1"` there rather than writing a separate grep, so the rule stays declared once and the author gets the same explanation.

## Say where the run broke its own budget

After the rule lands, one line per deviation, and only when there is one:

```
deviated: frozen at 772, step 2 measured 725, the two scopes differ
deviated: 4 commands to measure, the budget is 2
deviated: wrote the detector before the incident was known
```

**Nothing to say is the normal case, and then print nothing at all.** Not a summary, not `deviated: none`. A line that appears on every run stops being read, and then the one that matters gets skipped along with it.

Only what can be counted belongs here: the frozen total against the count the regime was chosen on, commands against the budget, the order the steps ran in, the runner's exit code, a piece of guidance you could not follow and its section title. Not an opinion on how it went.

It is a line in a terminal, nothing more: no file, no issue, no report sent anywhere. If it is worth more than that, the user is the one who decides.

## Invariants the runner enforces, and you should not work around

1. **Per file, not only in total**, so debt cannot migrate between files while the total holds.
2. **Baseline in version control**, so re-freezing is visible in review.
3. **`--update` only goes down.** If a rise is legitimate, it shows as a rise in one file and a fall in another, and the total holds. If it does not, the debt grew and the fix is the code, not the baseline.
4. **The failure teaches.** A rule with no `why` is refused at freeze. Step 3.
5. **The first freeze never fails.** Adoption costs nothing on day one, or it does not happen.

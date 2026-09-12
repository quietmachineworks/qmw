# Anatomy

## The five invariants

### 1. Count per file, not only in total

A file that gains an occurrence fails even if another lost one. Without this, debt migrates: a refactor moves twenty violations from one module to another, the total holds, the check stays green, and nothing improved.

The baseline therefore stores `{ total, byFile }`, and comparison happens per file.

### 2. Version the baseline in git

The baseline is a committed JSON file. Re-freezing it shows up in the pull request diff, so it is a visible act somebody can question, not a side effect nobody sees.

A baseline kept out of version control, or written to a cache, removes the only social mechanism that makes the ratchet hold.

### 3. `--update` only goes down

The runner refuses to write a baseline whose total is higher than the stored one:

```
refused: --update does not raise call-count (2 -> 3).
A baseline only goes down. Remove what was added, or fix it.
```

This is the invariant people skip, and skipping it is fatal. When a rise can be absorbed by re-freezing, the first inconvenient failure gets re-frozen instead of fixed, and every subsequent one follows. The check survives as decoration.

Legitimate rises exist: a file gets split, a directory renamed. Those show up as a rise in one file and a fall in another, and the total does not move, so `--update` accepts them.

### 4. The failure message teaches

A message that states the rule gets worked around. A message that states the consequence gets remembered.

Compare:

> Call-count assertions are banned by the test conventions.

with:

> A call-count assertion proves the code called what it was told to call, never that the result is right. One such test stayed green while the endpoint it covered returned 500 in production: the failure was a UNIQUE constraint, and a mock has no constraints. The test did not protect the path and it manufactured confidence, which is the worst of both halves.

The second one survives contact with a stranger. In six months, whoever hits this failure did not write the rule and may not be human. The message is the only thing left explaining why they should care.

Write the incident. If there is none yet, write what the rule protects against. If neither can be stated, reconsider the rule.

The runner refuses `--update` on a rule with no `why`. This is the invariant
with the weakest natural pressure behind it: a detector that counts correctly
looks finished, and the message is the part nobody notices missing until the
day it is needed. Asking the user for the incident before writing the file, not
after freezing, is what keeps that refusal from ever firing.

### 5. Never fail on the first freeze

Running `--update` on a repository that breaks the rule ten thousand times must succeed and must not block anything. Adoption has to cost nothing on day one, or it does not happen.

This is the whole reason a ratchet exists rather than a ban.

## What gets scanned, and why it matters

Inside a git repository the runner counts **tracked files**, not what happens to
sit on disk. Staged files count, so a violation is caught before it is pushed.

Anything else produces a check that disagrees with itself: a scratch file
nobody committed fails the run locally and cannot fail it in CI, so the author
sees a failure they cannot reproduce and nobody else can see. A check that
behaves differently depending on where it runs stops being believed, and a
check nobody believes is worse than none, because it still costs a CI step.

Outside a git repository the runner walks the filesystem instead. Both modes
hand `scan.match` the same repository-relative path, so a definition cannot
behave one way for a contributor and another way in CI.

## A ratchet nobody committed does not exist

The baseline is only half of it. The runner, the helper, the definition and the
baseline all have to be tracked, or the check passes on the machine that built
it and is absent everywhere else. There is no failure mode to observe: CI stays
green because there is nothing to run, and the only record left is a session
that reported the rule as done.

`git ls-files .ratchet` after committing is the whole verification.

## A ratchet frozen at zero is a gate

When a repository happens to be clean for a rule, the first freeze records zero
and every later occurrence is a rise. The ratchet then enforces exactly what a
gate would, without anyone having to decide it was strict enough to deserve
one.

This is worth knowing before reaching for `regime: 'gate'`. Measure first. A
rule you assumed was violated everywhere is sometimes already respected, and
freezing it at zero locks that in at no cost.

The distinction still matters for rules where the count will never be zero and
should still block, which is what the next section covers.

## When a gate is right instead

A gate tolerates nothing and stores no baseline. Use it when every occurrence is a production defect rather than debt.

The worked case, from a real codebase: an icon subset check. The application serves a subsetted icon font, and a name absent from that subset renders an empty square on a user's screen. No typecheck fails, no test goes red, no console error appears. There is no acceptable existing count to freeze, because every occurrence is already a visible defect in production.

Contrast with call-count assertions: 955 of them break the rule, and none of them takes production down this morning. That is debt, and debt ratchets.

Attribution in comments is also a gate, for a different reason: a single line is enough to leak provenance into a public repository, so the tolerated count is zero.

The question to ask is always the same. **Is every occurrence a defect, or is there acceptable existing debt?**

## The commit surface

Some rules apply to commit messages rather than files. Those are gates by nature, with one addition: a start date.

History predating a convention carries the old one, often by the thousand, and history is not rewritten to satisfy a check. A commit-surface rule therefore declares `since`, and only commits authored after that instant are judged.

Without `since`, the first run over a long history produces thousands of failures for commits nobody can legitimately fix, and the check gets disabled the same day.

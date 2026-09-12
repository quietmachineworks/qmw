---
name: status
description: Read qmw's own records under .qmw/ and report where the work stands - open bugs, changes landed, dependencies held with the price of unblocking them, the last release verdict. Writes nothing. Use when asked what has been done on a project, what is still open, where things stand, whether a bug was ever fixed, what is blocked, or to catch up on a codebase qmw has already worked.
license: MIT
---

# Status

The running record of what has been done to a project: the repairs signed off,
the bugs still open, the last release verdict. Read it when you pick a codebase
back up, so the work continues where it was left rather than from a blank slate.
This skill reads qmw's own records and reports where the work stands.

The other reading skill, `audit-agent`, audits the agent: what is installed and
what it earns. This one audits the work: what qmw has produced, across every
record it left. Neither touches code.

**Write nothing.** No files, no config, no commits, no "while I was there". This
skill reads the records and reports them; it never appends an entry, closes one,
or tidies one. An entry that changed is a lie about what qmw actually did.

## What it reads

qmw's records live under `.qmw/` at the repository top, one subdirectory per
skill.

- **`.qmw/fix-bug/`** - `log.md` is the index, one row per incident with its
  status and how many times it was seen; `SQ-<n>/report.md` carries the root
  cause and the proof. The open incidents are the finding that matters most.
- **`.qmw/run-qa/`** - the registry, with its resume-point block and its rows by
  status; `config.md` and the persona briefs say what a pass covers. Report the
  open findings and where a pass in progress was left.
- **`.qmw/refactor/log.md`** - one block per intervention, the class closed and
  the commit. The `next` line of the last block is a candidate someone named and
  did not start.
- **`.qmw/build-feature/log.md`** - one block per intention landed, the class of
  change and the commit, with its own `next` line.
- **`.qmw/upgrade-deps/log.md`** - raised, and held. The held section is the live
  one: each hold carries the price of unblocking it, and a hold whose price is a
  refactor of the project's own code is a `/qmw:refactor` mandate already written.
- **`.ratchet/`** - the checks the project froze and their baselines, when it
  carries them. A baseline is a number frozen in time, not a live count; report
  what is guarded, not a fresh measurement.

A record the project does not carry is named as absent, not invented. A project
qmw has never touched leaves no records, and that is the honest first line of
the report.

**Read the records, do not re-run the skills.** This skill does not reproduce a
bug to check it is still open, re-measure a ratchet, or replay a release check.
It reports what the records say and how fresh they are. A record that looks stale
against the tree (a fix-bug incident open on a screen that no longer exists, an
upgrade-deps hold on a dependency already raised) is a finding worth naming, not
a repair to make.

## The report

In the language of the conversation, read in a terminal. No tables: flat blocks,
so nothing wraps at eighty columns.

Open with the picture in a few lines: which records exist, the date of the most
recent entry across all of them, and the one sentence a returning reader wants,
usually the count of what is still open. Then, grouped by record and ordered by
what needs attention first:

```
fix-bug       2 open, oldest SQ-9 P1 on /billing, seen 3 times, red since 2026-08
  the report reproduces; no root cause recorded yet
upgrade-deps  1 held: left-pad, blocked on an API migration touching 4 files
  the price is a /qmw:refactor mandate, already written in the hold
refactor      last landed RF-7 on 2026-08-25; its next line names RF-8, not started
```

That block is nonsense on purpose; a real report comes from the records read,
never from this file. Each line is a fact the reader can act on: a status, a
date, a count, and the single next thing the record itself points at.

**Detail what needs a decision; list the rest.** An open P1, a hold whose price
is now cheap to pay, a pass left mid-resume: these get their block. Everything
green and closed is one line, named and counted, under a closing "also" line per
record. A report that reads back every closed entry buries the two that are
still open.

## Close on what to do

The last thing printed is the action list, three to five lines, ordered by what
is most worth picking up, written so each can be pasted or asked for:

```
/qmw:fix-bug resume SQ-9 - open P1, reproduces, no root cause recorded yet
/qmw:upgrade-deps left-pad - the hold's blocker is now a 4-file refactor, priced in the log
/qmw:refactor RF-8 - named as next by the last refactor, never started
```

Each action is the record's own next step, handed back as an invocation. The
skill does not decide what to work on; it says where the work was left and lets
the reader choose. **Nothing comes after the actions.** The bottom of a terminal
is the slot next to the prompt, and the actions own it.

## Say where the run broke its own budget

One line per deviation, after the report and before the actions, only when there
is one:

```
deviated: appended a note to a log it only reads, this skill writes nothing
deviated: reproduced SQ-9 to check it still fails, this skill reads records only
```

Nothing to say is the normal case, and then print nothing at all: not
`deviated: none`, not a compliance note. Only what can be counted belongs here -
files written against zero, the skills re-run against reading records only. A
report that quietly repaired what it read is no longer a record of what qmw
did, it is a record of what this skill did.

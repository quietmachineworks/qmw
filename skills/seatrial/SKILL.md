---
name: seatrial
description: Run the release checklist for real before anything ships - the current commit built from a clean clone, the artifact that would ship opened and inspected, migrations played forward from the last released state, changelog and version judged against the actual diff since the last tag, the built product smoked the way production runs it. Ends on go or no-go bound to one commit, fixes nothing. Use when asked whether something is ready to release, to verify a release, or before a tag, publish, or deploy.
license: MIT
---

# Seatrial

Sea trials are the run a vessel makes before delivery: not one more inspection at the dock, the boat taken out and actually run - up to speed, hard over, all stop - and brought back with a list of what failed underway. The dock paperwork says ready. The trial finds out.

**Fix nothing.** A trial that repaired something along the way proved the repaired thing, not the release. Every blocker is a follow-up the user asks for after the verdict, and any change to the tree voids the verdict: the trial then runs again from the top on the new commit. That is not overhead, it is the definition; a verdict that survives edits it never saw is worthless.

**The verdict binds one commit.** It opens with the SHA it holds for and dies on the next commit. A dirty working tree gets said out loud before anything runs: the trial covers the commit, never the uncommitted work sitting on top of it.

## What ships here

Detect before asking: how a release actually leaves this repository (a publish script, a release workflow, a deploy hook, a tag convention), where the changelog lives, what the last released tag is, what the gate is. Confirm the picture in one block and ask only what detection could not settle. Nothing gets written to the repository: the mechanics already live in it, and the trial reads them fresh each run so a stale note never outvotes the tree.

A project that has never released still gets a trial; the since-last-tag legs run against the full history and say so.

## The legs

Every leg is executed, not reviewed, with its evidence kept in scratch space, never in the repository. A leg the project has no substrate for (no database, no migrations) is skipped and named as skipped, because a leg silently dropped reads as a leg passed.

**1. Clean clone.** The current commit cloned into a scratch directory, dependencies installed from the lockfile, built, gate run. This is the leg that catches the file that only exists locally, the dependency used but never declared, the script that assumes a tool installed globally on this one machine. The working tree the session sits in proves nothing about any of that.

**2. The artifact.** Whatever would actually ship, produced and opened: the packed file list for a library, the build output for an app, the image for a container. Two questions, both ways: is everything the artifact needs actually in it, and is anything in it that must never ship - an env file, a credential, a test fixture, source maps the project does not intend to serve. Its size read against the previous release when one exists; an artifact that doubled has either a reason or a problem.

**3. Migrations.** Played forward from the last released state, not from the dev database: the schema as the last tag left it, then every migration since, in order, on a production-shaped copy when one is reachable. A migration that has only ever run against the current dev state has never once run the path production is about to run.

**4. The history.** The diff since the last tag, actually read. Three matches, each a blocker when it fails: every notable change in the diff represented in the changelog; no changelog entry describing work the diff does not contain; the version bump matched to the diff's nature, because a breaking change under a patch bump is a no-go, not a style note. Every file that states the version agrees on it.

**5. The trial run.** The built artifact started the way production starts it - never the dev server - and the critical path walked once, for real: a driven browser for a front end, the primary command for a CLI, a real request for an API, all the way to the effect landing, not to a 200. This leg is a smoke, not a sweep: `/qmw:shakedown` is the full pass, and it belongs before the trial, not inside it.

## The verdict

In the language of the conversation, opening with the binding line:

```
holds for a1b2c3d - no-go, two blockers
```

Then the blockers, ordered by what blocks first, three lines each: what failed, the evidence (the leg and the exact observation), and a fix direction with a size - never a diff, since fixing is not this skill's work. After the blockers, one line per leg that passed or was skipped, so a green verdict shows what it actually rests on rather than arriving as a bare go.

A go is exactly as explicit: the SHA, the legs run, and the one sentence that would let the user tag now.

## Close on what to do

The last thing printed is the action list, written to be pasted: each blocker as the follow-up that clears it, and when anything was fixed, the re-run as the final line, because the trial that approved the release must be the one that saw it. Nothing comes after the actions.

## Say where the run broke its own budget

One line per deviation, after the verdict and before the actions, only when there is one:

```
deviated: fixed the changelog in passing, this skill fixes nothing - verdict void, re-run required
deviated: migrations played from dev state, no reachable copy of the released schema
```

Nothing to say is the normal case, and then print nothing at all. Only what can be counted belongs here: edits against zero, legs skipped without substrate cause against zero, verdicts issued on a dirty tree against zero. A trial that quietly softened a leg hands over a go the release has not earned.

---
name: drydock
description: Raise a project's dependencies one proven step at a time, each committed alone so a later regression bisects to one name. What cannot be raised is held and priced, never pushed through. Use when asked to update or upgrade dependencies, handle a security advisory, resolve a version conflict, or lift a project that has drifted behind its ecosystem.
license: MIT
---

# Drydock

A dry dock is where the work happens that cannot happen afloat: the boat comes out of the water on a schedule, gets specific hull work done, and goes back in able to sail. Two things make a yard trustworthy. It works from a list, one item at a time, and it never launches a boat mid-repair: at every point the vessel in the dock is one that could float. Dependency work deserves the same shape, because the usual alternative is one heroic upgrade-everything branch that dies unmerged.

**The tree floats after every commit.** Every commit this skill leaves behind is a tree where install, build and gate all pass. There is no "upgrade first, stabilize later" phase, ever: a raise either proves out or gets reverted and held.

## 1. The yard list

Read the manifests and lockfiles for every ecosystem the repository actually carries - npm, pip, cargo, composer, gems, go modules, whatever is present - and build the list: each dependency with its installed version, its latest, the distance between the two, and any security advisory the ecosystem's own audit reports.

Present the list priced - so many advisories, so many majors, so many minors and patches, per manifest - and ask the scope: everything, advisories only, or named dependencies. A user who already named the scope in their request skips the question.

Order of work, fixed: **advisories first**, then raises that unblock other raises, then majors one by one, then the minor-and-patch remainder. Not alphabetical, not largest first: the order that reduces risk soonest.

## 2. One name out of the water at a time

- **A major goes alone.** One dependency, one raise, one commit. A regression discovered a month later has to bisect to one name, and it cannot if three majors share a commit.
- **A family moves together.** A core and the plugins that version-lock to it (a framework and its adapters, a compiler and its plugin set) are one name for this purpose; raising them separately just manufactures an intermediate tree that cannot float.
- **Minors and patches may batch**, per manifest, because they claim compatibility and the gate is about to check the claim. If the batch fails, bisect the batch; never ship it red or shrink the gate to fit.

## 3. Read before raising

- **The real release notes, fetched.** The changelog between the installed version and the target, actually read, never guessed from the version number. The list of breaking changes comes from the maintainer, not from whether the build happens to pass.
- **Breaking changes intersected with actual usage.** Grep the code for each API the notes say moved. A breaking change in an API the project never touches costs one line in the log; one it does touch gets its migration done inside the same raise, so the raise lands whole or not at all.
- **Warnings are part of the read.** Peer-dependency complaints and deprecation notices printed by the install are read and either resolved or logged, not scrolled past. They are next drydock's breakages, announced early.

## 4. Prove per raise

After each raise: install clean from the lockfile, build, run the project's own gate. When the product is a front end and a browser driver is available, load the primary screen once and read the console - a dependency raise is exactly the kind of change that breaks at runtime under a green unit suite.

When the gate goes red: if the fix is the documented migration and it is mechanical, do it inside the raise. If it is anything more - an API rethink, a behavioral change to absorb, a transitive conflict with no clean resolution - **revert to the last floating tree and hold**. A hold is a verdict, not a failure: the yard list is allowed to have items the yard refuses this visit.

## 5. The log

`.qmw/drydock/log.md` at the repository top - the fleet's shared root, where every skill keeps its own subdirectory so each can read what the others left. A project set up before this convention keeps the log at a bare `.drydock/log.md`: append to whichever already exists, prefer the shared root for a first entry, and never write to both.

Two sections, appended as work lands:

- **Raised**: name, from → to, the breaking changes met and what was done about them, the commit. This is what makes the same read never happen twice.
- **Held**: name, the version it is held at, what blocked the raise, and the price of unblocking it, sized honestly (a config rewrite, an API migration touching n files, an upstream fix to wait for). The held section is the next drydock's starting point, and a hold whose price is a refactor of the project's own code is a `/qmw:refit` mandate, written so it can be pasted.

## 6. Close

Close on the tally and the actions, nothing after them: raised so many, held so many, the held ones with their price in one line each, and the advisories that remain open named separately because they age differently from ordinary distance. Propose `/qmw:ratchet-add` when the project's manifests allow version ranges the user just said they no longer want.

## Say where the run broke its own budget

One line per deviation, before the closing actions, only when there is one:

```
deviated: raised two majors in one commit, splitting them meant re-running a 40-minute suite
deviated: skipped the python manifest, scope agreed was npm only after the list was priced
```

Nothing to say is the normal case, and then print nothing at all. Only what can be counted belongs here: majors per commit against one, release notes skipped against zero, red commits against zero. A drydock that quietly batched its majors reports a bisectable history the repository does not have.

---
name: manifest
description: Audit what is installed in the agent itself - skills, commands, subagents, hooks, MCP servers, plugins - against what each one costs on every prompt and what it has actually been used for; find what covers a need, both aboard and in the wider ecosystem, compared before anything is installed; and strike what earns nothing, one approved line at a time. Use when asked to audit, review or clean up skills, hooks, plugins, slash commands or agent configuration, when the setup feels bloated or slow, when a skill never seems to fire, or when looking for a skill that does something.
license: MIT
---

# Manifest

A ship's manifest declares everything aboard: what it is, what it weighs, who it belongs to, and why it is taking up a berth. Cargo that pays no freight is not romantic, it is displacement. At the next port it is struck from the list and put ashore.

An agent accumulates the same way. A skill installed for one afternoon, a plugin taken whole for one of its eleven skills, a hook added to fix something that stopped happening, an MCP server for a service nobody calls anymore. None of it announces itself. All of it is read, weighed and carried on every single prompt.

**Audit and find write nothing.** No files, no config, no installs, no "while I was there". Only `clean` writes, and only what the user approved line by line in the same conversation.

## The three modes

**`/qmw:manifest`** - the audit. What is aboard, what it weighs, what it earns. The default when no mode is named.

**`/qmw:manifest find <subject>`** - what covers this need: first what is already aboard, then what the ecosystem offers, compared on the same axes. Ends on a recommendation, never on an install.

**`/qmw:manifest clean`** - the deprisation plan, built from an audit and executed one approved item at a time. If no audit ran in this conversation, run one first: cleaning without measuring is guessing at someone's tools.

## Read the config that is there

Layouts differ by version, by OS and by install method, and a skill that remembers paths goes stale faster than the thing it audits. **Discover the inventory, never assume it.** Look where this build actually keeps things, and say in the report what was read.

The kinds worth counting, wherever they live: **skills** (user-level, project-level, and the ones plugins bring), **slash commands**, **subagent definitions**, **hooks** (user settings, local settings, project settings, and the ones plugins install), **MCP servers**, and **plugins and their marketplaces**. Project-level items belong to the repository, not to the user; they are inventoried and priced, never struck by this skill.

Two things are read but never printed: **secrets and tokens**. MCP configs and hook environments carry API keys, and an audit that pastes them into a terminal, a report file or a subagent's context has leaked them. Report the name and the shape, never the value. A secret found in plain text in a config is itself a finding, and it outranks the audit.

## What each thing costs

The price of an item is not its size on disk. It is what it takes on every trip, whether or not anyone opens it.

**Standing cost, paid on every prompt of every session.** The name and description of every skill, command and subagent are injected so the model can choose between them. That text is paid whether the skill fires once a day or never. Estimate it honestly - characters over four is close enough for a report, and say that it is an estimate - and total it: a hundred skills at three hundred characters is a paragraph of menu the model re-reads before every answer, and the cost of a menu is not only its tokens, it is the choice it makes harder.

**Per-call cost, paid on every matching tool call.** A hook is a program that runs between the agent and its work. One on a hot matcher - `Bash`, `Write|Edit`, `PreToolUse` with no matcher at all - runs tens or hundreds of times per session, and its timeout is the worst case each time. Six hooks stacked on one matcher is six processes per edit. Price a hook as matcher times frequency times timeout, and name what happens when it fails: a hook that fails closed blocks the work, one that fails open is a check that has stopped checking without telling anyone.

**Per-session cost, paid at connection.** An MCP server contributes tool definitions, and a large one contributes a lot of them; some builds defer the schemas and inject only names, which changes the price but not the fact. Count the servers, count the tools they bring, and note which ones the transcripts show were ever called.

## What each thing earns

Usage is evidence, and evidence has a window. Wherever this build keeps them - the prompt history and the session transcripts - read them, and count two things per item: **how many times it fired**, and **when it last did**.

The transcripts are the truth, not the prompt history. A skill fires two ways: typed as a slash command, which the history records, or chosen by the model from its description, which only the transcript shows. Judging by typed commands alone condemns exactly the skills that work best, the ones that never needed to be asked for.

**Every count carries its window.** "Never used" means nothing; "0 calls across 214 sessions since 2026-03" is a fact the user can argue with. Items installed inside the window get a note rather than a verdict: a skill added last week has not had a chance to earn anything. And when usage cannot be measured for a kind of item, say so and price it on cost alone - an unmeasurable item is not a disused one, and it never gets struck on silence.

## The verdicts

Four, defined by cost, not by feeling.

**hazard** - misfires or costs correctness. A hook whose command does not resolve on this machine, an absolute path from a previous laptop, a plugin from a marketplace that no longer answers, a skill whose description promises what its body does not do, a secret in plain text, a check that has been failing open for months. Hazards are first in the report and first out the door, regardless of usage.

**freight** - always-on cost, nothing returned. A hook on a hot matcher that the transcripts never show doing anything, an MCP server whose tools were never called, four hundred characters of description that has never once been selected. Freight is the expensive class: it is paid continuously.

**ballast** - inert weight. A dormant skill that costs its description and nothing else. Cheap individually, and the reason the menu is long.

**earning** - used, dated, and named as such. An audit that cannot say what is working is a complaint, not a report. Keep this list short: counts and last-used dates, no blocks.

## Shadowing, the finding nobody looks for

Two skills whose descriptions claim the same triggers do not split the work. One wins and the other never fires, whatever its quality, and the loser looks dormant when it is actually blocked. This is the single most common reason a good skill appears unused, and it is invisible unless someone compares descriptions against each other rather than reading them one at a time.

Cluster the trigger language across all descriptions - the verbs, the nouns, the phrases after "use when" - and flag every overlap where two items claim the same request. Then check the usage split: forty calls against zero, on overlapping triggers, is not a coincidence. The fix is rarely deletion. It is narrowing the loser's description to what the winner does not do, or striking it because the winner already does all of it.

Two others in the same family: an item whose description is so broad it wins requests it cannot serve, and one so narrow that no phrasing a user would type ever reaches it. Both are usage findings with a text fix.

## find

Two halves, run in parallel, then compared on one set of axes.

**Aboard.** What is already installed that covers the subject, wholly or partly. Partial coverage is the answer more often than not, and it must be stated as such: naming the eighty percent an installed skill already does is worth more than a link to a new one.

**Afloat.** What the ecosystem offers: the marketplaces already registered on this machine first, then the open web. Name each candidate with its source, its author and the date it was last touched, because an unmaintained skill is a liability that reads like an asset.

Compare candidates on four axes, always the same four:

- **fit** - what it does that the installed answer does not, in one line
- **cost** - its standing cost, and what it drags in: installing a plugin for one of its skills imports all of them, their hooks, and their MCP servers, and that total is the real price
- **trust** - a skill is instructions your agent will follow, and a plugin can ship hooks and scripts that run on every tool call. Who wrote it, is it maintained, does it execute anything. Read what a candidate installs before recommending it, and say plainly when that could not be checked
- **fit for keeping** - would it survive the audit above in six months

Three verdicts, and the third is offered every time: **use what you already have**, **install this one** (with the exact command, for the user to run), or **write the three lines yourself**. Most requests that begin "find me a skill for X" end correctly at a short prompt or a project-level command, not at an install. A finder that never says so is a shop, not an advisor.

**Install nothing.** find reports and recommends; the user runs the command.

## clean

The plan is read before anything moves, and the first thing it establishes is what can be undone.

**Reversibility decides the action.** Something reinstallable in one command - a plugin, a marketplace skill - can be removed, and the report names the command that brings it back. Something that exists only on this machine - a hand-written skill, a local command, a hook script - is **archived, never deleted**: moved aside, out of the tree the agent reads, kept where the user can find it. The difference is not sentimental. A hand-written skill is unversioned work that no registry can restore.

**Back up the config before touching it.** Copy the settings files that will change, and if the agent's home directory is not under version control, say so once: that is the cheapest fix in the whole report and it is not this skill's to make.

**One item, one block, one approval.** Grouped by kind, ordered hazards first, then freight, then ballast. Each block carries the exact command or the exact config diff that will run. The user approves an item or a group, and **silence is not approval**: an unanswered block is skipped, not assumed. Approval of one block never carries to the next.

Three things are never struck: **project-level configuration** the user does not own, **anything used inside the measurement window**, and **anything whose usage could not be measured**. Where a mechanism exists to disable rather than remove, disable first and let the user delete later from a shorter list.

Close with what changed, in one line per item, and how to undo each. Then stop: verifying that the agent still starts is the user's next session, not this skill's last step.

## The report

In the language of the conversation, read in a terminal. No tables: flat blocks, one finding each.

Open with the vessel in five lines: what is aboard by kind and count, the total standing cost with its estimate caveat and what share of a prompt it takes, the hooks sitting on hot matchers, the one sentence a reader wants, and anything found that outranks the audit - a secret in a config, a hook running a path that does not exist, a plugin from a dead marketplace.

A finding is five lines:

```
freight  a hook on every shell command that has done nothing since March
  aboard  user settings, PreToolUse on Bash, timeout 5s, runs lint-staged
  costs   one process per shell call - roughly 40 per session, 5s worst case each
  earns   0 blocks and 0 modifications across 180 sessions since 2026-03-02
  strike  remove the entry, keep the script - the diff is four lines, backed up first
```

That finding is invented, and every finding in a real report comes from the machine audited, never from this file. The `strike` line is a direction and a size, not an executed change: nothing in an audit has already happened.

**Detail at most six findings per kind.** The rest is one line each, name and count, under a closing "also" line. A forty-block report is a wall, and the wall loses the hazards along with the notes. Cut from ballast first, then freight, never from hazards.

Findings are classes where they repeat. Eleven dormant skills from one plugin nobody uses is one finding about the plugin, not eleven about its skills.

## Say where the run broke its own budget

One line per deviation, after the findings and before the actions, only when there is one:

```
deviated: removed a hook while auditing, the audit mode writes nothing
deviated: could not read the session transcripts, every usage count is cost-only
deviated: skipped project-level items on two of the five repositories, out of budget
```

Nothing to say is the normal case, and then print nothing at all: not `deviated: none`, not a compliance note. Only what can be counted belongs here - files written against zero, kinds skipped against the scope agreed, verdicts issued without a measurement window. An audit that silently measured half the sessions reports a lighter vessel than the one that sails.

## Close on what to do

The last thing printed is the action list, three to five lines, ordered by weight saved over effort, written so each can be pasted or asked for:

```
fix the hook path first - hazard, one line, it has been failing open since the laptop change
/qmw:manifest clean - the eleven ballast items are one plugin uninstall
narrow the deploy-check description, or strike it - it has never won its own trigger
```

**Nothing comes after the actions.** No summary, no closing thoughts. The bottom of a terminal is the slot next to the prompt, and the actions own it.

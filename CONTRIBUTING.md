# Contributing

## What belongs here

This repository is one plugin: eleven skills written as `SKILL.md` files, a
help map, a full-cycle passage, and the one executable it ships, the ratchet
runner under `skills/freeze-rule/scripts/`. [METHOD.md](METHOD.md) is the
discipline the skills share; read it before changing one.

Welcome:

- a skill that reads as optional where it is not, or that drifts from the line
  in METHOD.md (audits write nothing, repairs prove they did)
- a bug in the runner, ideally with a failing case added to `test/run.mjs`
- a gap in the ratchet format, described by the rule you could not express
- a stale name, a dead link, a claim the code no longer backs

Not welcome: detectors encoding one team's conventions. The examples show the
format; your rules come from your own repository.

Please open an issue before a large change, so the design discussion happens
before the work.

## Running the checks

```bash
node test/run.mjs      # the runner, against throwaway repositories in a temp dir
node test/repo.mjs     # manifests, versions, skills, links, examples agree
node .ratchet/ratchet.mjs house-style
claude plugin validate --strict .
claude plugin validate --strict .claude-plugin/plugin.json
claude plugin validate --strict skills
```

The first two need `git` and nothing else, no network and no install step. CI
runs all of it on every push and pull request.

Every invariant in `skills/freeze-rule/references/anatomy.md` has a case in
`test/run.mjs`. A change to runner behaviour needs a case that fails before it
and passes after. The runner is vendored into `.ratchet/` for this
repository's own checks; copy it again after changing it, `test/repo.mjs`
refuses a drifted copy.

The behavioral evals under `evals/` run with `claude plugin eval . --scaffold`
and call the model on your credentials. Run them when a skill's text or
description changes; they are not part of the default CI.

## Adding or changing a skill

- a folder under `skills/` whose name is what people type after `/qmw:`
- frontmatter `name` equal to the folder, a `description` under 1024 characters
  that says when to reach for it, `license: MIT`
- an audit skill declares `disallowed-tools: Write, Edit, NotebookEdit`; a skill
  that commits or drives a browser declares `disable-model-invocation: true`
- a mention in `README.md`, English and French, and in the `/qmw:help` map
- a line under Unreleased in `CHANGELOG.md`
- for an audit skill, an eval case under `evals/` asserting it wrote nothing

## Conventions

English everywhere in the tree. Comments explain a constraint a reader would
otherwise violate, and nothing else; if a comment states what the code is,
rename instead. No em dash anywhere, in code, prose, or commits: a comma, a
colon, a parenthesis, or two sentences. No attribution to an assistant, in
files or in commit trailers.

Commit subjects are one imperative sentence, capitalized, no type prefix and no
trailing period: `Add status, the fleet's records read back`. A release commit
reads `Cut 0.8.0, <what changed since 0.7.0>`.

`.ratchet/rules/house-style.mjs` holds the mechanizable part of this and CI
runs it. To be told before the push rather than after:

```bash
git config core.hooksPath .githooks
```

## Cutting a release

Bump `version` in `package.json` and `.claude-plugin/plugin.json`, move the
Unreleased section of `CHANGELOG.md` under a dated heading, commit, tag
`vX.Y.Z`, push the tag. The release workflow refuses a tag whose version the
manifests or the changelog do not carry, and publishes the changelog section as
the release notes.

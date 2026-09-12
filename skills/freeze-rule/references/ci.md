# Wiring CI

## Vendor the runner, do not depend on the skill

CI must not depend on an agent's skill directory being present. When you build
your first ratchet, copy the runner and its helper from the skill into
`.ratchet/` at your project root:

```
your-project/
  .ratchet/
    ratchet.mjs
    lib/source.mjs
    rules/
      no-call-count.mjs
      no-call-count-baseline.json
```

A bare name resolves under `.ratchet/rules/`, so a step reads
`ratchet.mjs no-call-count` rather than repeating the directory twice.

It is two files with no dependencies, and vendoring them means the check keeps
working when the skill is uninstalled, when CI runs without network, and when
someone clones the repository years later.

The alternative, `npm i -D @quietmachineworks/qmw` and calling
`node_modules/.bin/ratchet`, works too and buys version pinning at the cost of
a dependency.

## Check where the workflow runs before adding to it

Read the `on:` block first. A workflow with `branches-ignore: [main]` runs on
nothing when someone pushes to the default branch, and a repository whose
convention is to push directly there gains a ratchet that never executes.

The step still looks right in review, which is what makes this worth one read.
If the trigger does not cover the way the project actually lands code, say so
and let the user decide, rather than wiring the step and reporting it as done.

## GitHub Actions

Each ratchet is one step. Keep them separate so a failure names the rule in the job list rather than hiding inside a bundle.

```yaml
      - name: Ratchet, mock call counts
        run: node .ratchet/ratchet.mjs no-call-count

      - name: Ratchet, comment norms
        run: node .ratchet/ratchet.mjs house-style
```

Put them after `lint` and `typecheck` and before `test`. They are fast, they need no services, and failing early keeps a broken convention from consuming a full test run.

## Commit-surface rules need a range

```yaml
      - name: Gate, commit message norms
        run: node .ratchet/ratchet.mjs house-style --commits ${{ steps.scope.outputs.base }}..HEAD
```

The range is the pull request base to `HEAD`. Combined with the rule's `since`, only commits that are both new to this branch and authored after the convention took effect get judged.

The checkout must have history for this to work:

```yaml
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
```

A shallow checkout makes the range unresolvable, and the runner exits 2 with a readable message rather than a stack trace.

## Comment the step, not just the rule

The rule's `why` explains the rule to whoever trips it. A comment above the CI step explains to whoever reads the workflow why this step is worth its seconds.

Worth recording there: the incident, the count at first freeze, and what the check catches that the neighbouring steps do not. A real example, on a Vue type ratchet:

> `tsc` does not parse `.vue` files, neither the template nor `<script setup>`. The hub's typing was therefore verified on no page and no component. The first measurement under `vue-tsc` returned 968 errors, two thirds of them from a single bad signature. This step does not replace `typecheck`, it covers the half `tsc` never saw.

Without that note, the step looks redundant with `typecheck` and gets deleted by someone tidying the workflow.

## Catching a commit message as it is written

A commit-surface rule can also judge a single message before the commit
exists, which is where the author can still fix it in place:

```sh
#!/bin/sh
# .githooks/commit-msg
node .ratchet/ratchet.mjs house-style --message "$1" || exit 1
```

`--message` reads the file git passes as `$1` and applies every
commit-surface rule to it. The rule's `since` is ignored here: a message being
written now has no author date to compare against, and it is by definition
after any date the rule took effect on.

Prefer this over a bare `grep` in the hook. The rule stays declared in one
place, and the author gets the same explanation CI would have given them,
before the commit is written rather than after it is pushed.

## Pre-push hook

Catching a rise before it reaches CI saves a round trip. Same command, over the range being pushed.

```sh
#!/bin/sh
# .githooks/pre-push
node .ratchet/ratchet.mjs house-style || exit 1
node .ratchet/ratchet.mjs house-style --commits "@{push}..HEAD" || exit 1
```

Enable with `git config core.hooksPath .githooks`.

Keep the hook a mirror of CI, never a superset. A hook that blocks something CI would pass teaches people to use `--no-verify`, and then it blocks nothing at all.

## Freezing a baseline in a pull request

When a rise is legitimate, `--update` re-freezes and the changed baseline lands in the diff. That is the intended path: a reviewer sees the counts move and can ask why.

The runner refuses to raise a total, so a re-freeze in a diff can only mean the debt held steady or fell.

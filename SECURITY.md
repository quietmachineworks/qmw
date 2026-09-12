# Security

## What this plugin executes

A skill is instructions your agent will follow. Installing this plugin puts
thirteen `SKILL.md` files in front of your agent, and nothing else: no hooks,
no MCP servers, no subagent definitions, no install script. Read them; they are
prose, and short enough to read.

Four of the skills (`audit-rules`, `audit-codebase`, `check-release`, `status`)
remove the write and edit tools from the agent's pool for the turn they run in.
The skills that change a tree (`refactor`, `build-feature`, `upgrade-deps`,
`fix-bug`, `run-qa`, `freeze-rule`) commit on your behalf and say so; the four
heaviest run only when you type them.

The one executable is the ratchet runner. A ratchet definition is a JavaScript
module the runner imports and calls, so running one executes its `detect`
functions with the privileges of whoever started the process, in CI as much as
locally. Treat a definition from outside your project the way you would treat
any dependency that runs at build time: read it before adding it. The examples
in this repository are meant to be read and adapted, not fetched at run time.

The runner reads files and, for commit-surface rules, invokes `git log`. It
writes exactly one path, the baseline file declared by the definition, and
only under `--update`.

## Reporting a vulnerability

Open a private security advisory through the repository's Security tab. Please
do not open a public issue for a vulnerability.

Expect an acknowledgement within a week. This is a small project maintained by
one person, so a fix may take longer than an acknowledgement.

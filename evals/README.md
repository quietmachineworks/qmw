# Evals

Behavioral cases for the skills, in the layout `claude plugin eval` reads: one
directory per case, a `prompt.md` phrased the way a user would type it, a
`fixture.sh` that builds the repository the case needs, and one grader per
file under `graders/`.

The line in METHOD.md has two halves, and each has its cases. An audit skill's
case asserts the skill fired (`tool_used: Skill`) and nothing was written
(`tool_used` on `Write` and `Edit` with `max: 0`). A repair skill's case
asserts the proof: the gate run before the first edit and again after the last,
the whole class closed and not only the cited sites, the entry in the skill's
log under `.qmw/`, and fresh eyes on the diff by a sub-agent that did not do the
work. Half of it is mechanical, from the tool calls (`tool_used`, `tool_order`)
and from the log file itself (`target: { source: file, path }`); the rest is
judged from the reply. Those are the checks the text cannot make on itself.

Three things a repair case learns the hard way. A case that grants `Bash` runs
the agent in a sandbox, and on macOS `git` there can be the Xcode shim, which
cannot write its cache and fails; no grader may require a commit to have
happened, so the case asks for the commit or for the `deviated:` line that says
why there is none, which is what the discipline demands anyway. A skill that
pins, repairs and proves needs `timeout_seconds` in the high hundreds, and an
under-set one scores zero rather than reporting a timeout. And an `llm` grader
with `focus: trace` votes against a trace that plainly satisfies it, on one
narrow question as much as on five: a quarter of a megabyte of JSONL is past
what a judge reads reliably. Order is held by `tool_order` and `tool_used`
instead, and what the run must say about its own gate is judged from the reply.

```bash
claude plugin eval . --scaffold --judge-model sonnet --allow-tools Bash Write Edit   # from the plugin root; calls the model on your credentials
claude plugin eval . --scaffold --judge-model sonnet --case 'status-*' --runs 1
```

`--allow-tools` is the operator's grant for the gated tools; the repair cases
list them in `allowed_tools` and cannot pass without it. The audit cases do
not need it, and their `max: 0` graders hold either way.

The default judge is a small model and it marks correct replies wrong when
they are shaped differently from the rubric; `--judge-model sonnet` is what
the dispatch workflow uses. Rubrics here are written as numbered conditions
for that reason.

`--scaffold` runs each case's `fixture.sh` before Claude starts; without it the
workspace is empty and every case degrades to "no rules stated". The runs are
billed and not part of the default CI; `.github/workflows/evals.yml` runs them
on dispatch with a cost ceiling. Results land under `evals/results/`, which is
ignored.

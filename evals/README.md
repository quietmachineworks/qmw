# Evals

Behavioral cases for the skills, in the layout `claude plugin eval` reads: one
directory per case, a `prompt.md` phrased the way a user would type it, a
`fixture.sh` that builds the repository the case needs, and one grader per
file under `graders/`.

Each audit skill has a case whose graders assert two things: the skill fired
(`tool_used: Skill`), and nothing was written (`tool_used` on `Write` and
`Edit` with `max: 0`). Those are the two halves of the line in METHOD.md, and
they are the checks the text cannot make on itself.

```bash
claude plugin eval . --scaffold --judge-model sonnet          # from the plugin root; calls the model on your credentials
claude plugin eval . --scaffold --judge-model sonnet --case 'status-*' --runs 1
```

The default judge is a small model and it marks correct replies wrong when
they are shaped differently from the rubric; `--judge-model sonnet` is what
the dispatch workflow uses. Rubrics here are written as numbered conditions
for that reason.

`--scaffold` runs each case's `fixture.sh` before Claude starts; without it the
workspace is empty and every case degrades to "no rules stated". The runs are
billed and not part of the default CI; `.github/workflows/evals.yml` runs them
on dispatch with a cost ceiling. Results land under `evals/results/`, which is
ignored.

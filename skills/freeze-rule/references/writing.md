# Writing a detector

## Shape

```js
export default {
  name: 'comment-norms',
  baseline: 'scripts/comment-norms-baseline.json',   // optional, defaults next to this file
  scan: {
    dirs: ['apps', 'packages'],
    match: /\.(ts|tsx|vue|mjs|js|json)$/,             // widest set any rule needs
    skip: ['fixtures'],                               // added to the built-in skip list
  },
  rules: { /* ... */ },
}
```

`scan.match` is the union across rules. A rule narrows it with its own `match`.

Both are tested against the path **relative to the repository root**, so
`/^app\/.*\.ts$/` means what it looks like, and a definition behaves the same
inside a git repository and outside one.

`skip` matches any path segment, which makes it the place for a single
unwanted file as much as for a directory: `skip: ['fixtures',
'package-lock.json']`.

## Choosing the scope

This is the decision that fixes every number the rule will ever report, and the
one most likely to be made by accident. A scope that is too narrow does not
report an error, it reports a smaller count, and a smaller count is
indistinguishable from a cleaner repository.

Look at what the repository actually holds before writing the regex:

```bash
git ls-files | sed 's|.*/||' | awk -F. 'NF>1 {print "."$NF; next} {print "(none) "$0}' \
  | sort | uniq -c | sort -rn
```

One pass, and it usually changes the answer. Two traps it exposes:

**Files with no extension.** `Makefile`, `Dockerfile`, `Caddyfile`,
`.env.example`, `.gitignore`. An allowlist of extensions never sees them, and a
typography or attribution rule applies to them exactly as much as to a
component.

**Extensions nobody thought of.** `.webmanifest`, `.sql`, `.txt`, `.css`. Each
one missed is a silent hole in the count.

For a rule about text a human wrote, a denylist of binaries is usually the
honest shape, because it fails toward scanning too much rather than too little:

```js
match: /^(?!.*\.(jpe?g|png|webp|gif|ico|woff2?|ttf|pdf|mp4|zip)$).*$/i
```

For a rule about a language construct, an allowlist of the languages it can
appear in is right, and narrow on purpose.

Either way, **write what the scope excludes into the definition's header**. The
count means nothing without it, and the next person to read the baseline is
trying to work out whether a number is debt or an artefact.

Machine-written directories are worth excluding by name and saying so: an
agent state directory, a lockfile, a generated client. They are not authored,
nobody will fix them, and freezing them means the tool that writes them fails
the check on its next run.

## A rule

```js
'no-frobnicate': {              // a placeholder rule, deliberately fictional
  regime: 'ratchet',            // or 'gate'
  match: /\.(ts|vue)$/,         // optional, narrows scan.match
  detect: (source, path) => source.match(/\bfrobnicate\(/g) ?? [],
  escapes: [],                  // optional, see below
  why: 'What happened that made this worth checking.',
  instead: 'What to do in its place.',
}
```

`detect` returns an array of hits. Length is what gets counted.

`why` is required: `--update` refuses to freeze a rule without one, because a
placeholder written to be filled in later never is.

## Hits and escapes

A hit is a plain string, or an object when an escape needs more than the matched text to judge:

```js
{ value: 'ABC-123', context: '// see ABC-123 for the rationale', line: 42 }
```

Escapes test `context` when present, otherwise `value`. That distinction matters:

- `UTF-8` carries the exact shape of a ticket code, so the escape judges the matched value.
- A line naming an assistant as the subject of a directive (`User-agent: ClaudeBot`, a `.claude/` path) is legitimate, while the same words as a signature are not. The escape has to see the whole line.

Escapes exist to document false-positive reasoning in a readable place. Filtering inside `detect` works too, but then the reasoning is buried.

## Helpers

Import them relatively, `from './lib/source.mjs'`, never by absolute path: a
Windows path is not a legal ESM specifier and `import 'C:\\...'` fails to load
the definition at all.

`scripts/lib/source.mjs` provides:

- `isCommentLine(line)`
- `commentLines(source)`, yielding `{ text, number }`
- `commentLinesMatching(source, pattern, refine)`, one hit per matching comment line, carrying the line as context

`commentLinesMatching` counts lines rather than occurrences on purpose: a line carrying the same violation twice should not count double, or the baseline moves on a reformat.

## A detector may name what it forbids

The runner never scans `.ratchet/`, so a definition can contain the very thing it looks for:

```js
const BANNED = /\bfoo\b/g          // works, in .ratchet/rules/no-foo.mjs
const BANNED_CHAR = /\uXXXX/g      // works too, as does the character itself
```

Without that exclusion a detector finds itself, freezes one instead of zero, and the author ends up fighting their editor to write a character without writing it. If you see a count that is exactly one higher than expected, check whether the definition is counting itself.

## Be honest about the heuristic

Comment detection here is a line heuristic: a line whose first non-blank characters open or continue a comment. A trailing comment on a code line is not seen.

That is a deliberate limit, and the detector should say so in its own header. Parsing every language properly would buy precision a ratchet does not need, because it measures a direction rather than an exact count.

State the limit rather than hiding it. A reader who discovers an undocumented blind spot stops trusting the whole check.

## The commit surface

```js
'wip-in-commits': {
  surface: 'commits',
  since: '2026-08-15T11:05:00+02:00',
  detect: (message) => message.match(/\bWIP\b/g) ?? [],
  why: '...',
  instead: '...',
}
```

`detect` receives the full message, subject and body. Commit rules are gates and store nothing. `since` is what keeps a long history from producing thousands of unfixable failures on the first run.

**Set `since` to the moment you add the rule.** Today's date, current time. Do not go looking for when the last violation happened: history before the rule took effect is not judged either way, since nobody rewrites merged commits to satisfy a check. Searching for that boundary is archaeology that changes nothing and costs a great deal, and `git log --since` prunes traversal, so it answers a subtly different question than the one being asked.

Run them with `--commits base..head`, typically over the pull request range in CI and over the pushed range in a pre-push hook.

## What not to write

Some rules are real and still not mechanizable: "keep functions readable", "do not over-abstract". A detector that approximates a judgment call produces false positives, and a check that cries wolf gets disabled within a month, taking the honest checks with it.

Narrow the rule until a detectable core appears, or say plainly that it does not belong in a check.

## What changes

## Why

If this changes a skill: which side of the line in METHOD.md it sits on, and
what in the text keeps it there.

If this changes runner behaviour: which invariant in
`skills/freeze-rule/references/anatomy.md` it touches, and what stops it from
weakening one.

## Checks

- [ ] `node test/run.mjs` and `node test/repo.mjs` pass
- [ ] a skill change is mirrored in `README.md` (both languages), the `/qmw:help` map, and `CHANGELOG.md`
- [ ] a runner change has a case that fails before it and passes after, and `.ratchet/` was re-copied
- [ ] no em dash, no attribution trailer, no stale name

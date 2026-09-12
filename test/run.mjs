#!/usr/bin/env node
/**
 * Runs the runner against throwaway repositories built in a temp directory.
 *
 * Every invariant in references/anatomy.md gets a case here, because each one
 * exists to stop a specific failure and a regression on any of them turns the
 * mechanism into decoration without breaking anything visibly.
 */
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const RUNNER = resolve(HERE, '..', 'skills', 'freeze-rule', 'scripts', 'ratchet.mjs')

let passed = 0
const failures = []

function check(name, condition, detail = '') {
  if (condition) {
    passed += 1
    return
  }
  failures.push(`${name}${detail ? `\n    ${detail}` : ''}`)
}

/** Returns `{ code, out }`, never throws: a non-zero exit is a normal outcome. */
function ratchet(root, definition, ...flags) {
  try {
    const out = execFileSync('node', [RUNNER, definition, ...flags], {
      env: { ...process.env, RATCHET_ROOT: root },
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'pipe'],
    })
    return { code: 0, out }
  } catch (error) {
    return { code: error.status, out: `${error.stdout ?? ''}${error.stderr ?? ''}` }
  }
}

function sandbox(files) {
  const root = mkdtempSync(join(tmpdir(), 'ratchet-test-'))
  for (const [path, content] of Object.entries(files)) {
    const full = join(root, path)
    mkdirSync(dirname(full), { recursive: true })
    writeFileSync(full, content)
  }
  return root
}

const COUNT_FOO = `export default {
  name: 'demo',
  baseline: 'baseline.json',
  scan: { dirs: ['src'], match: /\\.ts$/ },
  rules: {
    foo: {
      regime: 'ratchet',
      detect: (source) => source.match(/foo/g) ?? [],
      why: 'because foo broke production once',
      instead: 'use bar',
    },
  },
}
`

// --- invariant 5: the first freeze never fails ---------------------------
{
  const root = sandbox({ 'src/a.ts': 'foo foo foo\n', 'demo.mjs': COUNT_FOO })
  const first = ratchet(root, join(root, 'demo.mjs'), '--update')
  check('first freeze succeeds on a violating repo', first.code === 0, first.out)
  check('first freeze reports the starting count', first.out.includes('foo=3'), first.out)
  rmSync(root, { recursive: true, force: true })
}

// --- verify passes when nothing moves ------------------------------------
{
  const root = sandbox({ 'src/a.ts': 'foo foo\n', 'demo.mjs': COUNT_FOO })
  ratchet(root, join(root, 'demo.mjs'), '--update')
  const verify = ratchet(root, join(root, 'demo.mjs'))
  check('verify passes when the count holds', verify.code === 0, verify.out)
  rmSync(root, { recursive: true, force: true })
}

// --- a rise fails, and the message teaches -------------------------------
{
  const root = sandbox({ 'src/a.ts': 'foo\n', 'demo.mjs': COUNT_FOO })
  ratchet(root, join(root, 'demo.mjs'), '--update')
  writeFileSync(join(root, 'src/a.ts'), 'foo foo\n')
  const verify = ratchet(root, join(root, 'demo.mjs'))
  check('a rise exits non-zero', verify.code === 1, verify.out)
  check('the failure names the file and the counts', verify.out.includes('src/a.ts: 1 -> 2'), verify.out)
  check('the failure carries why', verify.out.includes('broke production once'), verify.out)
  check('the failure carries instead', verify.out.includes('use bar'), verify.out)
  rmSync(root, { recursive: true, force: true })
}

// --- invariant 1: debt cannot migrate between files ----------------------
{
  const root = sandbox({ 'src/a.ts': 'foo foo\n', 'src/b.ts': '\n', 'demo.mjs': COUNT_FOO })
  ratchet(root, join(root, 'demo.mjs'), '--update')
  writeFileSync(join(root, 'src/a.ts'), 'foo\n')
  writeFileSync(join(root, 'src/b.ts'), 'foo\n')
  const verify = ratchet(root, join(root, 'demo.mjs'))
  check('a moved violation fails even at equal total', verify.code === 1, verify.out)
  rmSync(root, { recursive: true, force: true })
}

// --- invariant 3: --update refuses to raise ------------------------------
{
  const root = sandbox({ 'src/a.ts': 'foo\n', 'demo.mjs': COUNT_FOO })
  ratchet(root, join(root, 'demo.mjs'), '--update')
  writeFileSync(join(root, 'src/a.ts'), 'foo foo\n')
  const raise = ratchet(root, join(root, 'demo.mjs'), '--update')
  check('--update refuses a rise', raise.code === 1, raise.out)
  check('the refusal explains the rule', raise.out.includes('only goes down'), raise.out)
  rmSync(root, { recursive: true, force: true })
}

// --- a fall is accepted --------------------------------------------------
{
  const root = sandbox({ 'src/a.ts': 'foo foo foo\n', 'demo.mjs': COUNT_FOO })
  ratchet(root, join(root, 'demo.mjs'), '--update')
  writeFileSync(join(root, 'src/a.ts'), 'foo\n')
  const lower = ratchet(root, join(root, 'demo.mjs'), '--update')
  check('--update accepts a fall', lower.code === 0, lower.out)
  check('the new floor is recorded', lower.out.includes('foo=1'), lower.out)
  rmSync(root, { recursive: true, force: true })
}

// --- a missing baseline is a readable error, not a crash -----------------
{
  const root = sandbox({ 'src/a.ts': 'foo\n', 'demo.mjs': COUNT_FOO })
  const verify = ratchet(root, join(root, 'demo.mjs'))
  check('a missing baseline exits 1', verify.code === 1, verify.out)
  check('it says how to create one', verify.out.includes('--update'), verify.out)
  rmSync(root, { recursive: true, force: true })
}

// --- gates tolerate nothing and need no baseline -------------------------
{
  const GATE = `export default {
  name: 'gated',
  baseline: 'baseline.json',
  scan: { dirs: ['src'], match: /\\.ts$/ },
  rules: {
    banned: {
      regime: 'gate',
      detect: (source) => source.match(/banned/g) ?? [],
      escapes: [/allowed/],
      why: 'every occurrence is a defect',
    },
  },
}
`
  const clean = sandbox({ 'src/a.ts': 'fine\n', 'gate.mjs': GATE })
  const direct = ratchet(clean, join(clean, 'gate.mjs'))
  check('a clean gate passes without a baseline ever frozen', direct.code === 0, direct.out)
  const freeze = ratchet(clean, join(clean, 'gate.mjs'), '--update')
  check('freezing a gate-only definition writes nothing', freeze.code === 0 && !existsSync(join(clean, 'baseline.json')), freeze.out)
  rmSync(clean, { recursive: true, force: true })

  const dirty = sandbox({ 'src/a.ts': 'banned\n', 'gate.mjs': GATE })
  const verify = ratchet(dirty, join(dirty, 'gate.mjs'))
  check('a gate fails on a single occurrence', verify.code === 1, verify.out)
  rmSync(dirty, { recursive: true, force: true })
}

// --- a global flag on a path filter must not skip every other file ---------
{
  const GLOBAL = COUNT_FOO.replace('match: /\\.ts$/', 'match: /\\.ts$/g')
  const root = sandbox({ 'src/a.ts': 'foo\n', 'src/b.ts': 'foo\n', 'src/c.ts': 'foo\n', 'src/d.ts': 'foo\n', 'g.mjs': GLOBAL })
  const freeze = ratchet(root, join(root, 'g.mjs'), '--update')
  check('scan.match with a g flag sees every file', freeze.out.includes('foo=4'), freeze.out)
  rmSync(root, { recursive: true, force: true })
}

// --- a detector without a global flag counts one hit, not its groups ------
{
  const GROUPS = COUNT_FOO.replace('source.match(/foo/g)', 'source.match(/(f)(o)(o)/)')
  const root = sandbox({ 'src/a.ts': 'foo foo\n', 'groups.mjs': GROUPS })
  const freeze = ratchet(root, join(root, 'groups.mjs'), '--update')
  check('a non-global match is one hit', freeze.out.includes('foo=1'), freeze.out)
  rmSync(root, { recursive: true, force: true })
}

// --- a dangling symlink does not crash the filesystem walk ----------------
{
  const root = sandbox({ 'src/a.ts': 'foo\n', 'demo.mjs': COUNT_FOO })
  symlinkSync(join(root, 'nowhere.ts'), join(root, 'src', 'dangling.ts'))
  const freeze = ratchet(root, join(root, 'demo.mjs'), '--update')
  check('a dangling symlink is skipped', freeze.code === 0 && freeze.out.includes('foo=1'), freeze.out)
  rmSync(root, { recursive: true, force: true })
}

// --- a malformed definition is a readable error, not a stack trace --------
{
  const root = sandbox({
    'src/a.ts': 'foo\n',
    'norules.mjs': "export default { name: 'x', scan: { dirs: ['src'], match: /x/ } }\n",
    'badrule.mjs': "export default { name: 'x', scan: { dirs: ['src'], match: /x/ }, rules: { r: { regime: 'ratchet', why: 'w' } } }\n",
    'noscan.mjs': "export default { name: 'x', rules: { r: { regime: 'ratchet', detect: () => [], why: 'w' } } }\n",
  })
  for (const file of ['norules.mjs', 'badrule.mjs', 'noscan.mjs']) {
    const result = ratchet(root, join(root, file))
    check(`${file} exits 2`, result.code === 2, result.out)
    check(`${file} names the fault`, result.out.includes('invalid definition') && !result.out.includes('    at '), result.out)
  }
  rmSync(root, { recursive: true, force: true })
}

// --- escapes judge the surrounding line ----------------------------------
{
  // A file URL, not a path: `C:\...` is not a legal ESM specifier.
  const HELPER = pathToFileURL(resolve(HERE, '..', 'skills', 'freeze-rule', 'scripts', 'lib', 'source.mjs')).href
  const ESCAPED = `import { commentLinesMatching } from ${JSON.stringify(HELPER)}
export default {
  name: 'escaped',
  baseline: 'baseline.json',
  scan: { dirs: ['src'], match: /\\.ts$/ },
  rules: {
    signature: {
      regime: 'gate',
      detect: (source) => commentLinesMatching(source, /Generated by Bot/),
      escapes: [/config/],
      why: 'attribution does not belong in code',
    },
  },
}
`
  const root = sandbox({
    'src/bad.ts': '// Generated by Bot\n',
    'src/ok.ts': '// Generated by Bot, named here as a config value\n',
    'esc.mjs': ESCAPED,
  })
  ratchet(root, join(root, 'esc.mjs'), '--update')
  const verify = ratchet(root, join(root, 'esc.mjs'))
  check('the escaped line is spared', !verify.out.includes('src/ok.ts'), verify.out)
  check('the unescaped line is caught', verify.out.includes('src/bad.ts'), verify.out)
  rmSync(root, { recursive: true, force: true })
}

// --- a per-rule filter narrows the scanned set ---------------------------
{
  const NARROW = `export default {
  name: 'narrow',
  baseline: 'baseline.json',
  scan: { dirs: ['src'], match: /\\.(ts|json)$/ },
  rules: {
    everywhere: {
      regime: 'ratchet',
      detect: (source) => source.match(/x/g) ?? [],
      why: 'w',
    },
    codeonly: {
      regime: 'ratchet',
      match: /\\.ts$/,
      detect: (source) => source.match(/x/g) ?? [],
      why: 'w',
    },
  },
}
`
  const root = sandbox({ 'src/a.ts': 'x\n', 'src/b.json': '"x"\n', 'narrow.mjs': NARROW })
  const freeze = ratchet(root, join(root, 'narrow.mjs'), '--update')
  check('an unfiltered rule sees both files', freeze.out.includes('everywhere=2'), freeze.out)
  check('a filtered rule sees only its own', freeze.out.includes('codeonly=1'), freeze.out)
  rmSync(root, { recursive: true, force: true })
}

// --- the commit surface, including the start date ------------------------
{
  const COMMITS = `export default {
  name: 'commits',
  baseline: 'baseline.json',
  scan: { dirs: ['src'], match: /\\.ts$/ },
  rules: {
    subject: {
      surface: 'commits',
      since: '2000-01-01T00:00:00Z',
      detect: (message) => message.match(/WIP/g) ?? [],
      why: 'a work-in-progress subject says nothing later',
    },
  },
}
`
  const root = sandbox({ 'src/a.ts': '\n', 'commits.mjs': COMMITS })
  const git = (...args) =>
    execFileSync('git', ['-c', 'user.email=t@t', '-c', 'user.name=t', ...args], {
      cwd: root,
      stdio: 'ignore',
    })
  git('init', '-q')
  git('add', '-A')
  git('commit', '-q', '-m', 'feat: a clean subject')
  const clean = ratchet(root, join(root, 'commits.mjs'), '--commits', 'HEAD')
  check('a clean range passes', clean.code === 0, clean.out)

  git('commit', '-q', '--allow-empty', '-m', 'WIP something')
  const dirty = ratchet(root, join(root, 'commits.mjs'), '--commits', 'HEAD~1..HEAD')
  check('an offending commit fails', dirty.code === 1, dirty.out)
  check('the offending subject is shown', dirty.out.includes('WIP something'), dirty.out)

  const bad = ratchet(root, join(root, 'commits.mjs'), '--commits', 'HEAD~99..HEAD')
  check('an unresolvable range exits 2', bad.code === 2, bad.out)
  check('an unresolvable range stays readable', !bad.out.includes('at measureCommits'), bad.out)
  rmSync(root, { recursive: true, force: true })
}

// --- commits authored before `since` are not judged -----------------------
{
  const FUTURE = `export default {
  name: 'future',
  baseline: 'baseline.json',
  scan: { dirs: ['src'], match: /\\.ts$/ },
  rules: {
    subject: {
      surface: 'commits',
      since: '2099-01-01T00:00:00Z',
      detect: (message) => message.match(/WIP/g) ?? [],
      why: 'w',
    },
  },
}
`
  const root = sandbox({ 'src/a.ts': '\n', 'future.mjs': FUTURE })
  const git = (...args) =>
    execFileSync('git', ['-c', 'user.email=t@t', '-c', 'user.name=t', ...args], {
      cwd: root,
      stdio: 'ignore',
    })
  git('init', '-q')
  git('add', '-A')
  git('commit', '-q', '-m', 'WIP not judged, predates the rule')
  const result = ratchet(root, join(root, 'future.mjs'), '--commits', 'HEAD')
  check('history predating `since` is not judged', result.code === 0, result.out)
  rmSync(root, { recursive: true, force: true })
}

// --- a bare name resolves under .ratchet/rules ---------------------------
{
  const root = sandbox({
    'src/a.ts': 'foo\n',
    '.ratchet/rules/demo.mjs': COUNT_FOO.replace("baseline: 'baseline.json',", ''),
  })
  const freeze = ratchet(root, 'demo', '--update')
  check('a bare name resolves to .ratchet/rules', freeze.code === 0, freeze.out)
  const verify = ratchet(root, 'demo')
  check('the resolved definition verifies', verify.code === 0, verify.out)
  const missing = ratchet(root, 'nope')
  check('an unresolvable name exits 2', missing.code === 2, missing.out)
  check('it names both paths tried', missing.out.includes('.ratchet/rules/nope.mjs'), missing.out)
  rmSync(root, { recursive: true, force: true })
}

// --- one message from a file, for a commit-msg hook ----------------------
{
  const MSG = `export default {
  name: 'msg',
  scan: { dirs: ['src'], match: /\\.ts$/ },
  rules: {
    attribution: {
      surface: 'commits',
      since: '2099-01-01T00:00:00Z',
      detect: (message) => message.match(/Co-Authored-By/g) ?? [],
      why: 'provenance belongs to history, not to a trailer',
      instead: 'drop the trailer',
    },
  },
}
`
  const root = sandbox({
    'src/a.ts': '\n',
    '.ratchet/rules/msg.mjs': MSG,
    'clean.txt': 'feat: a clean subject\n',
    'dirty.txt': 'feat: a subject\n\nCo-Authored-By: someone\n',
  })
  const clean = ratchet(root, 'msg', '--message', join(root, 'clean.txt'))
  check('a clean message passes', clean.code === 0, clean.out)

  const dirty = ratchet(root, 'msg', '--message', join(root, 'dirty.txt'))
  check('an offending message fails', dirty.code === 1, dirty.out)
  check('the message failure teaches', dirty.out.includes('belongs to history'), dirty.out)
  // `since` is in the far future: a message being written now is judged anyway,
  // because it has no author date to compare against.
  check('since does not exempt a message being written', dirty.code === 1, dirty.out)

  const missing = ratchet(root, 'msg', '--message', join(root, 'nope.txt'))
  check('an unreadable message exits 2', missing.code === 2, missing.out)
  rmSync(root, { recursive: true, force: true })
}

// --- a definition never counts itself ------------------------------------
{
  const SELF = `export default {
  name: 'self',
  scan: { dirs: ['.'], match: /\\.(ts|mjs)$/ },
  rules: {
    marker: {
      regime: 'ratchet',
      detect: (source) => source.match(/ZZMARKERZZ/g) ?? [],
      why: 'w',
    },
  },
}
`
  const root = sandbox({ 'src/a.ts': 'ZZMARKERZZ\n', '.ratchet/rules/self.mjs': SELF })
  const freeze = ratchet(root, 'self', '--update')
  check('a definition naming its own pattern is not counted', freeze.out.includes('marker=1'), freeze.out)
  rmSync(root, { recursive: true, force: true })
}

// --- tracked files only, so local and CI agree ---------------------------
{
  const root = sandbox({ 'src/a.ts': 'foo\n', '.ratchet/rules/t.mjs': COUNT_FOO.replace("baseline: 'baseline.json',", '') })
  const git = (...args) =>
    execFileSync('git', ['-c', 'user.email=t@t', '-c', 'user.name=t', ...args], { cwd: root, stdio: 'ignore' })
  git('init', '-q')
  git('add', '-A')
  git('commit', '-q', '-m', 'initial')
  ratchet(root, 't', '--update')

  writeFileSync(join(root, 'src/untracked.ts'), 'foo foo foo\n')
  const withUntracked = ratchet(root, 't')
  check('an untracked file is not judged', withUntracked.code === 0, withUntracked.out)

  git('add', 'src/untracked.ts')
  const staged = ratchet(root, 't')
  check('staging it makes it count', staged.code === 1, staged.out)
  rmSync(root, { recursive: true, force: true })
}

// --- outside a git repository, the filesystem walk still works ------------
{
  const root = sandbox({ 'src/a.ts': 'foo foo\n', 'demo.mjs': COUNT_FOO })
  const freeze = ratchet(root, join(root, 'demo.mjs'), '--update')
  check('a non-git directory falls back to walking', freeze.out.includes('foo=2'), freeze.out)
  rmSync(root, { recursive: true, force: true })
}

// --- match sees the repo-relative path, and both modes agree --------------
{
  const SCOPED = `export default {
  name: 'scoped',
  baseline: 'baseline.json',
  scan: { dirs: ['.'], match: /^app\\/.*\\.ts$/ },
  rules: {
    foo: {
      regime: 'ratchet',
      detect: (source) => source.match(/foo/g) ?? [],
      why: 'w',
    },
  },
}
`
  const tree = { 'app/a.ts': 'foo\n', 'legacy/b.ts': 'foo foo\n', 'scoped.mjs': SCOPED }

  const loose = sandbox(tree)
  const walked = ratchet(loose, join(loose, 'scoped.mjs'), '--update')
  check('a path-anchored match holds outside git', walked.out.includes('foo=1'), walked.out)
  rmSync(loose, { recursive: true, force: true })

  const repo = sandbox(tree)
  const git = (...args) =>
    execFileSync('git', ['-c', 'user.email=t@t', '-c', 'user.name=t', ...args], {
      cwd: repo,
      stdio: 'ignore',
    })
  git('init', '-q')
  git('add', '-A')
  git('commit', '-q', '-m', 'initial')
  const tracked = ratchet(repo, join(repo, 'scoped.mjs'), '--update')
  check('a path-anchored match holds inside git', tracked.out.includes('foo=1'), tracked.out)
  check('both modes agree on one tree', walked.out === tracked.out, `${walked.out} vs ${tracked.out}`)
  rmSync(repo, { recursive: true, force: true })
}

// --- invariant 4: a rule with no why cannot be frozen ---------------------
{
  const MUTE = COUNT_FOO.replace("      why: 'because foo broke production once',\n", '')
  const root = sandbox({ 'src/a.ts': 'foo\n', 'mute.mjs': MUTE })
  const freeze = ratchet(root, join(root, 'mute.mjs'), '--update')
  check('freezing a rule with no why is refused', freeze.code === 1, freeze.out)
  check('the refusal names the rule', freeze.out.includes('no why on foo'), freeze.out)
  check('the refusal says what to write', freeze.out.includes('consequence observed'), freeze.out)
  rmSync(root, { recursive: true, force: true })
}

if (failures.length > 0) {
  console.error(`\n${failures.length} failing:\n`)
  for (const failure of failures) console.error(`  ${failure}`)
  console.error('')
  process.exit(1)
}
console.log(`${passed} checks passed`)

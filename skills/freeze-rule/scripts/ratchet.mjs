#!/usr/bin/env node
/**
 * Generic runner for ratchets and gates.
 *
 * A ratchet freezes how much of a violation a repository already carries, then
 * fails when that number rises. It is the only way to adopt a rule on a
 * codebase that already breaks it: a hard ban would require fixing every
 * existing case before the rule can be turned on at all, so it never is.
 *
 * A gate tolerates nothing and needs no baseline. Use it when every occurrence
 * is a production defect rather than debt.
 *
 * Usage:
 *   node ratchet.mjs <definition.mjs>            verify, exit 1 on a rise
 *   node ratchet.mjs <definition.mjs> --update   re-freeze the baseline
 *   node ratchet.mjs <definition.mjs> --message <path>   judge one message
 *
 * `--update` refuses to raise a rule's total. A baseline only goes down.
 * Without that refusal the ratchet becomes decorative: any rise could be
 * absorbed by re-freezing instead of by fixing.
 */
import { execFileSync } from 'node:child_process'
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path'
import { pathToFileURL } from 'node:url'

const DEFAULT_SKIP = new Set([
  // A definition is never part of what it measures. Without this, a detector
  // looking for a character has to avoid writing that character, and a rule
  // banning a word cannot name the word it bans.
  '.ratchet',
  'node_modules',
  'dist',
  '.nuxt',
  '.output',
  '.data',
  'coverage',
  '.git',
  'test-results',
  'playwright-report',
])

function walk(dir, skip, out = []) {
  let entries
  try {
    entries = readdirSync(dir)
  } catch {
    return out
  }
  for (const entry of entries) {
    if (skip.has(entry)) continue
    const path = join(dir, entry)
    if (statSync(path).isDirectory()) walk(path, skip, out)
    else out.push(path)
  }
  return out
}

/**
 * A hit is a plain string, or `{ value, context, line }` when the rule needs an
 * escape to judge more than the matched text. `context` is what escapes test:
 * `UTF-8` carries the shape of a ticket code, and a `User-agent:` line names an
 * assistant as the subject of a directive rather than as an author.
 */
const contextOf = (hit) => (typeof hit === 'string' ? hit : (hit.context ?? hit.value))

/**
 * The tracked files under `dirs`, or null outside a git repository.
 *
 * Tracked rather than present on disk, so a local run and CI see the same set.
 * A scratch file nobody committed is not the repository's problem, and judging
 * it locally while CI cannot means a failure the author cannot reproduce.
 * Staged files count, so a violation is caught before it is pushed.
 */
function trackedFiles(dirs, root) {
  try {
    const out = execFileSync('git', ['ls-files', '-z', '--', ...dirs], {
      cwd: root,
      encoding: 'utf-8',
      maxBuffer: 64 * 1024 * 1024,
      stdio: ['ignore', 'pipe', 'ignore'],
    })
    return out.split('\0').filter(Boolean).map((relative) => join(root, relative))
  } catch {
    return null
  }
}

/**
 * Counts hits per rule per file. A rule may narrow the scanned set further.
 *
 * `scan.match` and a rule's `match` are both tested against the path relative
 * to the repository root, so `/^app\//` means what it looks like and a
 * definition behaves identically inside a git repository and outside one.
 *
 * Keys are forward-slashed on every platform. `relative()` hands back `src\a.ts`
 * on Windows, which no `/^src\//` in any definition matches, which silently
 * defeats every path-anchored rule and the `skip` walk with it. Worse, the
 * separator lands in the baseline: a total frozen on Windows and verified in
 * Linux CI shares not one key with the run that judges it, so every file reads
 * as new. Splitting on `sep` rather than replacing backslashes keeps a POSIX
 * filename that legally contains one intact.
 */
function measure(definition, root) {
  const { scan, rules } = definition
  const skip = new Set([...DEFAULT_SKIP, ...(scan.skip ?? [])])
  const found = trackedFiles(scan.dirs, root) ?? scan.dirs.flatMap((dir) => walk(join(root, dir), skip))
  const files = found
    .map((file) => relative(root, file).split(sep).join('/'))
    .filter((key) => !key.split('/').some((part) => skip.has(part)) && scan.match.test(key))
  const byRule = {}

  for (const name of Object.keys(rules)) byRule[name] = { total: 0, byFile: {} }

  for (const key of files) {
    let source
    for (const [name, rule] of Object.entries(rules)) {
      if (rule.match && !rule.match.test(key)) continue
      source ??= readFileSync(join(root, key), 'utf-8')
      let hits = rule.detect(source, key) ?? []
      if (rule.escapes?.length) {
        hits = hits.filter((hit) => !rule.escapes.some((escape) => escape.test(contextOf(hit))))
      }
      if (hits.length > 0) {
        byRule[name].byFile[key] = hits.length
        byRule[name].total += hits.length
      }
    }
  }

  return { byRule, scanned: files.length }
}

/**
 * Commit surface. Judges only commits authored after the rule took effect:
 * history predating a typography decision carries the old convention by the
 * thousand, and history is not rewritten to satisfy a gate.
 */
function measureCommits(rule, range, root) {
  const FIELD = '\u001f'
  const RECORD = '\u001e'
  let raw
  try {
    raw = execFileSync('git', ['log', `--format=%H${FIELD}%aI${FIELD}%s%n%b${RECORD}`, range], {
      cwd: root,
      encoding: 'utf-8',
      maxBuffer: 32 * 1024 * 1024,
      stdio: ['ignore', 'pipe', 'pipe'],
    })
  } catch (error) {
    const reason = String(error.stderr ?? '').trim().split('\n')[0] || error.message
    console.error(`cannot read commits over ${range}: ${reason}`)
    process.exit(2)
  }

  const since = rule.since ? new Date(rule.since) : null
  const guilty = []
  for (const entry of raw.split(RECORD)) {
    const [sha, date, message] = entry.split(FIELD)
    if (!sha?.trim() || !date) continue
    if (since && new Date(date) < since) continue
    if ((rule.detect(message ?? '') ?? []).length > 0) {
      guilty.push({ sha: sha.trim().slice(0, 9), subject: (message ?? '').split('\n')[0] })
    }
  }
  return guilty
}

function loadBaseline(path, updating) {
  try {
    return JSON.parse(readFileSync(path, 'utf-8'))
  } catch {
    if (updating) return { byRule: {} }
    console.error(
      `no baseline at ${path}\n` +
        'Create it with --update. The first freeze records current debt and ' +
        'never fails, so it is safe to run on a repository that already ' +
        'breaks the rule.',
    )
    process.exit(1)
  }
}

/** A gate is judged against zero, so it needs no stored baseline. */
function expected(baseline, ruleName, rule, file) {
  if (rule.regime === 'gate') return 0
  return baseline.byRule?.[ruleName]?.byFile?.[file] ?? 0
}

function report(definition, current, baseline) {
  let failed = false

  for (const [ruleName, rule] of Object.entries(definition.rules)) {
    const rises = []
    for (const [file, count] of Object.entries(current.byRule[ruleName].byFile)) {
      const was = expected(baseline, ruleName, rule, file)
      if (count > was) rises.push({ file, was, now: count })
    }

    if (rises.length === 0) {
      const total = current.byRule[ruleName].total
      const frozen = baseline.byRule?.[ruleName]?.total ?? 0
      const removed = frozen - total
      const trend = removed > 0 ? `, ${removed} fewer` : ''
      console.log(
        rule.regime === 'gate'
          ? `ok  ${ruleName}: none found`
          : `ok  ${ruleName}: ${total} (frozen at ${frozen}${trend})`,
      )
      continue
    }

    failed = true
    console.error(
      rule.regime === 'gate'
        ? `\nFAIL ${ruleName}: not tolerated, found ${rises.length} file(s):\n`
        : `\nFAIL ${ruleName}: rising, not allowed:\n`,
    )
    for (const rise of rises) {
      console.error(rule.regime === 'gate' ? `  ${rise.file}` : `  ${rise.file}: ${rise.was} -> ${rise.now}`)
    }
    if (rule.why) console.error(`\n${rule.why}`)
    if (rule.instead) console.error(`\n${rule.instead}`)
    if (rule.regime === 'ratchet') {
      console.error(
        '\nIf the rise is legitimate (file moved, spec split), re-freeze with ' +
          '--update, which refuses to raise the total.',
      )
    }
    console.error('')
  }

  return failed
}

/**
 * A rule without a `why` cannot be frozen. The message is the whole mechanism:
 * in six months whoever trips the check did not write the rule and may not be
 * human, and it is the only thing left explaining why they should care.
 *
 * Checked at freeze rather than at verify, so an omission is caught by the
 * author who made it instead of by a pipeline that was green yesterday.
 */
function requireWhy(rules) {
  const mute = Object.entries(rules)
    .filter(([, rule]) => !rule.why?.trim())
    .map(([name]) => name)
  if (mute.length === 0) return
  console.error(
    `refused: no why on ${mute.join(', ')}.\n` +
      'Write the consequence observed, not the rule restated. A message that ' +
      'says a pattern is banned gets worked around; one that names what broke ' +
      'gets remembered.',
  )
  process.exit(1)
}

function update(definition, current, baseline, baselinePath) {
  for (const [ruleName, rule] of Object.entries(definition.rules)) {
    if (rule.regime === 'gate') continue
    const was = baseline.byRule?.[ruleName]?.total
    const now = current.byRule[ruleName].total
    if (was !== undefined && now > was) {
      console.error(
        `refused: --update does not raise ${ruleName} (${was} -> ${now}).\n` +
          'A baseline only goes down. Remove what was added, or fix it.',
      )
      process.exit(1)
    }
  }

  const stored = { byRule: {} }
  for (const [ruleName, rule] of Object.entries(definition.rules)) {
    if (rule.regime === 'gate') continue
    stored.byRule[ruleName] = current.byRule[ruleName]
  }
  writeFileSync(baselinePath, `${JSON.stringify(stored, null, 2)}\n`)

  const summary = Object.entries(stored.byRule)
    .map(([name, data]) => `${name}=${data.total}`)
    .join(' ')
  console.log(`frozen: ${summary}`)
}

/**
 * Judges one message read from a file, for a `commit-msg` hook where no commit
 * exists yet. `since` is not applied: the message is being written now, so it
 * is by definition after any date the rule took effect on.
 */
function reportMessage(definition, messagePath) {
  let message
  try {
    message = readFileSync(messagePath, 'utf-8')
  } catch {
    console.error(`cannot read the message at ${messagePath}`)
    process.exit(2)
  }

  let failed = false
  for (const [name, rule] of Object.entries(definition.rules)) {
    if (rule.surface !== 'commits') continue
    if ((rule.detect(message) ?? []).length === 0) continue
    failed = true
    console.error(`\nFAIL ${name}: in this commit message\n`)
    console.error(`  ${message.split('\n')[0]}`)
    if (rule.why) console.error(`\n${rule.why}`)
    if (rule.instead) console.error(`\n${rule.instead}`)
    console.error('')
  }
  return failed
}

/** Runs every commit-surface rule over `range`. Always a gate, never frozen. */
function reportCommits(definition, range, root) {
  let failed = false
  for (const [name, rule] of Object.entries(definition.rules)) {
    if (rule.surface !== 'commits') continue
    const guilty = measureCommits(rule, range, root)
    if (guilty.length === 0) {
      console.log(`ok  ${name}: clean over ${range}`)
      continue
    }
    failed = true
    console.error(`\nFAIL ${name}: ${guilty.length} commit(s):\n`)
    for (const commit of guilty) console.error(`  ${commit.sha}  ${commit.subject}`)
    if (rule.why) console.error(`\n${rule.why}`)
    if (rule.instead) console.error(`\n${rule.instead}`)
    console.error('')
  }
  return failed
}

/**
 * A path a human reads: relative while it stays under the working directory,
 * absolute once `relative()` would climb out of it, forward-slashed either way.
 * A run whose root sits elsewhere, a temp directory or a sibling checkout, turns
 * an honest absolute path into `..\..\..\..\AppData\Local\Temp\...`, which names
 * the same file and helps nobody read it.
 */
const readable = (path) => {
  const near = relative(process.cwd(), path)
  return (near.startsWith('..') ? path : near).split(sep).join('/')
}

/**
 * A bare name resolves to `.ratchet/rules/<name>.mjs`, so a CI line reads
 * `ratchet.mjs no-todo` rather than repeating the directory twice. An explicit
 * path always wins, and a name that resolves to nothing reports both tries.
 */
function resolveDefinition(given, root) {
  const direct = isAbsolute(given) ? given : resolve(process.cwd(), given)
  if (existsSync(direct)) return direct

  const byName = resolve(root, '.ratchet', 'rules', `${given}.mjs`)
  if (existsSync(byName)) return byName

  console.error(`no definition at ${readable(direct)}\nand none at ${readable(byName)}`)
  process.exit(2)
}

export async function run(
  definitionPath,
  { root = process.cwd(), updating = false, commits, message } = {},
) {
  // Resolved against the invocation directory, not the scanned root: a ratchet
  // definition is shipped by this package and points at someone else's repo.
  const absolute = resolveDefinition(definitionPath, root)
  const loaded = (await import(pathToFileURL(absolute).href)).default
  const definition = {
    ...loaded,
    rules: Object.fromEntries(
      Object.entries(loaded.rules).filter(([, rule]) => rule.surface !== 'commits'),
    ),
  }

  if (message) return reportMessage(loaded, message) ? 1 : 0
  if (commits) return reportCommits(loaded, commits, root) ? 1 : 0
  if (updating) requireWhy(loaded.rules)

  const baselinePath = loaded.baseline
    ? resolve(root, loaded.baseline)
    : join(dirname(absolute), `${loaded.name}-baseline.json`)

  const current = measure(definition, root)
  const baseline = loadBaseline(baselinePath, updating)

  if (updating) {
    update(definition, current, baseline, baselinePath)
    return 0
  }

  console.log(`${loaded.name}: ${current.scanned} files scanned`)
  return report(definition, current, baseline) ? 1 : 0
}

const [, , definitionPath, ...flags] = process.argv
if (definitionPath) {
  const commitsFlag = flags.indexOf('--commits')
  if (commitsFlag !== -1 && !flags[commitsFlag + 1]) {
    console.error('usage: ratchet.mjs <definition.mjs> --commits <base>..<head>')
    process.exit(2)
  }
  const messageFlag = flags.indexOf('--message')
  if (messageFlag !== -1 && !flags[messageFlag + 1]) {
    console.error('usage: ratchet.mjs <definition.mjs> --message <path>')
    process.exit(2)
  }
  const code = await run(definitionPath, {
    root: process.env.RATCHET_ROOT ?? process.cwd(),
    updating: flags.includes('--update'),
    commits: commitsFlag === -1 ? undefined : flags[commitsFlag + 1],
    message: messageFlag === -1 ? undefined : flags[messageFlag + 1],
  })
  process.exit(code)
}

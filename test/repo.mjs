#!/usr/bin/env node
/**
 * Checks the repository agrees with itself: manifests, versions, skills,
 * the help map, the README, the vendored runner, markdown links, examples.
 *
 * Every check here exists because its absence once let something ship that
 * failed on somebody else's machine and stayed green here.
 */
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const read = (path) => readFileSync(join(ROOT, path), 'utf-8')
const failures = []
const fail = (message) => failures.push(message)

const AUDIT_SKILLS = ['audit-rules', 'audit-codebase', 'check-release', 'status']
const MANUAL_SKILLS = ['run-qa', 'fix-bug', 'upgrade-deps', 'build-feature', 'full-cycle', 'help']
const DESCRIPTION_MAX = 1024

// --- manifests parse and agree -------------------------------------------
const pkg = JSON.parse(read('package.json'))
const plugin = JSON.parse(read('.claude-plugin/plugin.json'))
const marketplace = JSON.parse(read('.claude-plugin/marketplace.json'))
for (const entry of marketplace.plugins) {
  for (const field of ['name', 'description', 'category', 'source', 'homepage']) {
    if (!entry[field]) fail(`marketplace.json: ${entry.name ?? '?'} is missing ${field}`)
  }
}
const names = marketplace.plugins.map((entry) => entry.name)
if (names.length !== 1 || names[0] !== plugin.name) fail(`index lists ${JSON.stringify(names)}, plugin is ${plugin.name}`)
if (marketplace.plugins[0]?.description !== plugin.description) fail('plugin.json and marketplace.json carry different descriptions')

// --- one version, stated three times ---------------------------------------
const released = read('CHANGELOG.md').match(/^## \[(\d+\.\d+\.\d+)\] - \d{4}-\d{2}-\d{2}/m)?.[1]
if (pkg.version !== plugin.version) fail(`package.json says ${pkg.version}, plugin.json says ${plugin.version}`)
if (released !== pkg.version) fail(`CHANGELOG's last release is ${released}, package.json says ${pkg.version}`)

// --- skills: folder, frontmatter, description, tools -----------------------
const skills = readdirSync(join(ROOT, 'skills')).filter((name) => statSync(join(ROOT, 'skills', name)).isDirectory())
const frontmatterOf = (text) => {
  const match = text.match(/^---\n([\s\S]*?)\n---\n/)
  if (!match) return null
  const fields = {}
  for (const line of match[1].split('\n')) {
    const found = line.match(/^([a-z-]+):\s*(.*)$/)
    if (found) fields[found[1]] = found[2]
  }
  return fields
}
for (const skill of skills) {
  const path = `skills/${skill}/SKILL.md`
  if (!existsSync(join(ROOT, path))) {
    fail(`${skill}: no SKILL.md`)
    continue
  }
  const fields = frontmatterOf(read(path))
  if (!fields) {
    fail(`${path}: no frontmatter`)
    continue
  }
  if (fields.name !== skill) fail(`${path}: name is ${fields.name ?? 'missing'}, folder is ${skill}`)
  if (!fields.description) fail(`${path}: no description`)
  else if (fields.description.length > DESCRIPTION_MAX) fail(`${path}: description is ${fields.description.length} chars, over ${DESCRIPTION_MAX}`)
  if (AUDIT_SKILLS.includes(skill)) {
    for (const tool of ['Write', 'Edit', 'NotebookEdit']) {
      if (!fields['disallowed-tools']?.includes(tool)) fail(`${path}: an audit skill must disallow ${tool}`)
    }
  }
  if (MANUAL_SKILLS.includes(skill) && fields['disable-model-invocation'] !== 'true') {
    fail(`${path}: must declare disable-model-invocation: true`)
  }
}

// --- every skill is invoked where a newcomer looks, and nothing else is ----
const readme = read('README.md')
const help = read('skills/help/SKILL.md')
for (const skill of skills) {
  if (!readme.includes(`/qmw:${skill}`)) fail(`${skill}: never invoked in README.md`)
  if (!help.includes(`/qmw:${skill}`)) fail(`${skill}: missing from the /qmw:help map`)
}

// --- markdown: every /qmw: reference and every relative link resolves ------
const tracked = execFileSync('git', ['ls-files', '-z'], { cwd: ROOT, encoding: 'utf-8' }).split('\0').filter(Boolean)
const markdown = tracked.filter((path) => path.endsWith('.md'))
for (const path of markdown) {
  const text = read(path)
  // The changelog is history and carries the names skills had before 0.7.0.
  if (path !== 'CHANGELOG.md') {
    for (const match of text.matchAll(/\/qmw:([a-z0-9-]+)/g)) {
      if (!skills.includes(match[1])) fail(`${path} invokes /qmw:${match[1]}, which does not exist`)
    }
  }
  for (const match of text.matchAll(/\[[^\]]*\]\(([^)\s#]+)(?:#[^)]*)?\)/g)) {
    const target = match[1]
    if (/^[a-z]+:/.test(target)) continue
    if (!existsSync(resolve(ROOT, dirname(path), target))) fail(`${path} links to ${target}, which does not exist`)
  }
  for (const match of text.matchAll(/`(references\/[a-z-]+\.md)`/g)) {
    if (!existsSync(resolve(ROOT, dirname(path), match[1]))) fail(`${path} cites ${match[1]}, which does not exist`)
  }
}

// --- the vendored runner is the shipped runner ----------------------------
for (const [vendored, shipped] of [
  ['.ratchet/ratchet.mjs', 'skills/freeze-rule/scripts/ratchet.mjs'],
  ['.ratchet/lib/source.mjs', 'skills/freeze-rule/scripts/lib/source.mjs'],
]) {
  if (read(vendored) !== read(shipped)) fail(`${vendored} has drifted from ${shipped}; copy it again`)
}

// --- the examples load -----------------------------------------------------
for (const example of readdirSync(join(ROOT, 'examples')).filter((name) => name.endsWith('.mjs'))) {
  try {
    await import(pathToFileURL(join(ROOT, 'examples', example)).href)
  } catch (error) {
    fail(`examples/${example} does not load: ${error.message.split('\n')[0]}`)
  }
}

if (failures.length > 0) {
  console.error(`\n${failures.length} problem(s):\n`)
  for (const failure of failures) console.error(`  ${failure}`)
  console.error('')
  process.exit(1)
}
console.log(`${skills.length} skills, one version, every link and invocation resolves`)

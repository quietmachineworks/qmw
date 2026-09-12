/**
 * Comment norms, five rules over three regimes.
 *
 * Four are frozen per file, because a repository that adopts these norms
 * already carries thousands of violations and fixing them all first is a
 * project, not a prerequisite. One is a gate: attribution tolerates nothing,
 * since a single line is enough to leak provenance into a public repository.
 *
 * Adjust the wording to your own conventions. What is worth keeping is the
 * shape: a rule states its reason, not just its verdict.
 */
import { commentLinesMatching } from '../skills/freeze-rule/scripts/lib/source.mjs'

const EM_DASH = /\u2014/g
const REGISTRY_CODE = /\b[A-Z][A-Z0-9]{1,14}-\d{1,4}\b/g
const TODO = /\b(TODO|FIXME)\b/g
const ACCENTED = /[àâäçéèêëîïôöùûüÿœæ]/i

/** Standards and algorithms carry the shape of a ticket without being one. */
const NOT_A_TICKET =
  /^(UTF|ISO|RFC|SHA|AES|RSA|HTTP|TLS|SSL|CVE|GMT|UTC|ES|IPV|EC|RGB|CJK|BCP|IEEE|ANSI|EN|NF|PBKDF)-\d+$/

const AI_ATTRIBUTION =
  /(Co-Authored-By\s*:\s*(?:Claude|GPT|ChatGPT|Copilot|Gemini|Codex|Cursor|an?\s+AI)|Generated (?:with|by)\s+(?:Claude|GPT|ChatGPT|Copilot|Gemini|Codex|Cursor))/i

const CODE = /\.(ts|tsx|vue|mjs|cjs|js)$/

export default {
  name: 'comment-norms',
  scan: {
    dirs: ['apps', 'packages'],
    match: /\.(ts|tsx|vue|mjs|cjs|js|json)$/,
  },
  rules: {
    'em-dash': {
      regime: 'ratchet',
      detect: (source) => source.match(EM_DASH) ?? [],
      why: 'The typography convention admits no em dash.',
      instead:
        'Punctuation that says the same thing: a comma, a colon, a bracket, a ' +
        'semicolon, or two sentences.',
    },

    'ticket-code': {
      regime: 'ratchet',
      match: CODE,
      detect: (source) =>
        commentLinesMatching(source, REGISTRY_CODE, (value) => !NOT_A_TICKET.test(value)),
      why:
        'A ticket code in a comment ties the code to a tracker that outlives ' +
        'neither the ticket nor the tool. Six months later the reference is ' +
        'dead and the comment explains nothing.',
      instead:
        'State the constraint the reader would otherwise violate. Bug history ' +
        'belongs to commit messages and to the tracker.',
    },

    'todo-fixme': {
      regime: 'ratchet',
      match: CODE,
      detect: (source) => source.match(TODO) ?? [],
      why:
        'A TODO is a decision deferred with no owner and no date. The target ' +
        'for this rule is zero, not merely stable.',
      instead: 'Do it, or open an issue and drop the comment.',
    },

    'non-english-comment': {
      regime: 'ratchet',
      match: CODE,
      detect: (source) => commentLinesMatching(source, ACCENTED),
      why: 'Comments are written in English, and kept to the strict minimum.',
      instead:
        'Rewrite in English. If the comment only restates what the code says, ' +
        'delete it and rename instead.',
    },

    attribution: {
      regime: 'gate',
      match: CODE,
      detect: (source) => commentLinesMatching(source, AI_ATTRIBUTION),
      // Naming an assistant as the SUBJECT of a technical directive stays
      // legitimate: a `User-agent:` line, a `.claude/` path in a config.
      escapes: [/\.claude\//, /User-agent/i, /\.gitignore/, /robots\.txt/],
      why:
        'Code stands on its own. Provenance belongs to commit history, not to ' +
        'a line that will be read by everyone who opens the file.',
      instead: 'Remove the attribution.',
    },

    'em-dash-in-commits': {
      surface: 'commits',
      since: '2026-08-15T11:05:00+02:00',
      detect: (message) => message.match(EM_DASH) ?? [],
      why:
        'The typography convention covers commit messages. History predating ' +
        'the decision is not judged, which is what `since` is for.',
      instead:
        'Rewrite the offending messages with `git rebase -i`, or `git commit ' +
        '--amend` for the last one.',
    },
  },
}

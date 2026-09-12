/**
 * House style for this repository, the rules its own docs state.
 *
 * Scope: every tracked text file except CHANGELOG.md and LICENSE. The
 * changelog carries the names skills had before 0.7.0 as history, and history
 * is not rewritten to satisfy a check. Every rule counts occurrences in the
 * whole file, prose included, so no comment heuristic is involved.
 */

const EM_DASH = /\u2014/g
const OLD_NAMES = /\b(survey|refit|drydock|shakedown|squawk|seatrial|haulout|ratchet-add|ratchet-audit)\b/g
const TODO = /\b(TODO|FIXME)\b/g
const AI_ATTRIBUTION =
  /(Co-Authored-By\s*:\s*(?:Claude|GPT|ChatGPT|Copilot|Gemini|Codex|Cursor)|Generated (?:with|by)\s+(?:Claude|GPT|ChatGPT|Copilot|Gemini|Codex|Cursor))/gi
const AI_TRAILER = /^(Co-Authored-By\s*:\s*(?:Claude|GPT|ChatGPT|Copilot|Gemini|Codex|Cursor)|Claude-Session\s*:|Generated with \[?Claude)/gim

const TEXT = /^(?!.*\.(png|jpe?g|gif|webp|ico|woff2?|ttf|pdf|zip)$).*$/i
const PROSE_AND_CODE = /\.(md|json|mjs|yml)$/

export default {
  name: 'house-style',
  scan: { dirs: ['.'], match: TEXT, skip: ['CHANGELOG.md', 'LICENSE'] },
  rules: {
    'em-dash': {
      regime: 'gate',
      detect: (source) => source.match(EM_DASH) ?? [],
      why: 'The typography convention admits no em dash, in code, prose, or messages.',
      instead: 'A comma, a colon, a parenthesis, a semicolon, or two sentences.',
    },

    'old-names': {
      regime: 'gate',
      match: PROSE_AND_CODE,
      detect: (source) => source.match(OLD_NAMES) ?? [],
      why:
        'The 0.7.0 rename replaced the nautical handles with descriptive ones. A ' +
        'stale name sends a reader to a command that does not exist, and the ' +
        'example that imported the old skill path loaded on nobody\'s machine for ' +
        'a release without CI noticing.',
      instead:
        'audit-codebase, refactor, upgrade-deps, run-qa, fix-bug, check-release, ' +
        'audit-agent, audit-rules, freeze-rule, full-cycle.',
    },

    'todo-fixme': {
      regime: 'ratchet',
      match: /^(?!examples\/).*\.(mjs|yml)$/,
      detect: (source) => source.match(TODO) ?? [],
      why: 'A TODO is a decision deferred with no owner and no date. The target is zero.',
      instead: 'Do it, or open an issue and drop the comment.',
    },

    'ai-attribution': {
      regime: 'gate',
      match: PROSE_AND_CODE,
      detect: (source) => source.match(AI_ATTRIBUTION) ?? [],
      why:
        'Code and docs stand on their own. Provenance belongs to nobody\'s trailer ' +
        'in a public repository.',
      instead: 'Remove the attribution.',
    },

    'em-dash-in-commits': {
      surface: 'commits',
      since: '2026-09-12T20:00:00+02:00',
      detect: (message) => message.match(EM_DASH) ?? [],
      why: 'The typography convention covers commit messages.',
      instead: 'Rewrite the subject or body with a comma, a colon, or two sentences.',
    },

    'ai-attribution-in-commits': {
      surface: 'commits',
      since: '2026-09-12T20:00:00+02:00',
      detect: (message) => message.match(AI_TRAILER) ?? [],
      why:
        'No AI attribution in commit messages, public or private. A trailer added ' +
        'by a tool will be added again by the same tool unless the hook refuses it.',
      instead: 'Drop the trailer; the commit stands on its diff and its subject.',
    },
  },
}

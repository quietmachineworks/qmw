/**
 * Helpers shared by ratchet definitions.
 *
 * Comment detection is a line heuristic: a line whose first non-blank
 * characters open or continue a comment. A trailing comment on a code line is
 * therefore not seen. Parsing every language properly would buy precision a
 * ratchet does not need, because it measures a direction rather than an exact
 * count.
 */

const COMMENT_OPENER = /^\s*(\/\/|\/\*|\*|<!--|#)/

export const isCommentLine = (line) => COMMENT_OPENER.test(line)

/** Yields `{ text, number }` for every comment line, 1-indexed. */
export function* commentLines(source) {
  for (const [index, text] of source.split('\n').entries()) {
    if (isCommentLine(text)) yield { text, number: index + 1 }
  }
}

/**
 * One hit per comment line matching `pattern`, carrying the line as context so
 * escapes can judge it. Counting lines rather than occurrences keeps a line
 * that carries the same violation twice from counting double, which would make
 * the baseline move for a reformat.
 */
export function commentLinesMatching(source, pattern, refine) {
  const hits = []
  for (const { text, number } of commentLines(source)) {
    const found = text.match(pattern)
    if (!found) continue
    if (refine && !found.some((value) => refine(value))) continue
    hits.push({ value: found[0], context: text, line: number })
  }
  return hits
}

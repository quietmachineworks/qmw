#!/bin/bash
set -e
git init -q
mkdir -p src/orders src/invoices src/reports test .qmw/fix-bug .qmw/refactor
cat > package.json <<'EOF2'
{ "name": "fixture", "version": "0.0.0", "type": "module", "scripts": { "test": "node --test" } }
EOF2
cat > src/orders/format.js <<'EOF2'
export function formatDate(d) {
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  return `${day}/${month}/${d.getFullYear()}`
}
EOF2
cat > src/invoices/format.js <<'EOF2'
export function formatDate(d) {
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  return dd + '/' + mm + '/' + d.getFullYear()
}
EOF2
cat > src/reports/format.js <<'EOF2'
const pad = (n) => (n < 10 ? '0' + n : String(n))
export function formatDate(d) {
  return [pad(d.getDate()), pad(d.getMonth() + 1), d.getFullYear()].join('/')
}
EOF2
cat > src/orders/list.js <<'EOF2'
import { formatDate } from './format.js'
export function listOrders(rows) {
  return rows.map((row) => ({ ...row, date: formatDate(row.createdAt) }))
}
EOF2
cat > src/invoices/render.js <<'EOF2'
import { formatDate } from './format.js'
export function renderInvoice(invoice) {
  return `Invoice ${invoice.number}, issued ${formatDate(invoice.issuedAt)}`
}
EOF2
cat > src/reports/summary.js <<'EOF2'
import { formatDate } from './format.js'
export function summarize(period) {
  return `${formatDate(period.from)} to ${formatDate(period.to)}`
}
EOF2
cat > test/orders.test.js <<'EOF2'
import test from 'node:test'
import assert from 'node:assert/strict'
import { listOrders } from '../src/orders/list.js'

test('listOrders formats the creation date as dd/mm/yyyy', () => {
  const [row] = listOrders([{ id: 1, createdAt: new Date(2026, 0, 5) }])
  assert.equal(row.date, '05/01/2026')
})
EOF2
cat > test/invoices.test.js <<'EOF2'
import test from 'node:test'
import assert from 'node:assert/strict'
import { renderInvoice } from '../src/invoices/render.js'

test('renderInvoice prints the issue date as dd/mm/yyyy', () => {
  const line = renderInvoice({ number: 'F-12', issuedAt: new Date(2026, 11, 31) })
  assert.equal(line, 'Invoice F-12, issued 31/12/2026')
})
EOF2
cat > .qmw/fix-bug/config.md <<'EOF2'
# fix-bug config

- Launch: library, no server and no URL
- Access: none needed
- Breakpoints: none, no front end
- Gate: `npm test`, confirmed 2026-09-01
EOF2
cat > .qmw/refactor/log.md <<'EOF2'
RF-1  the two slugify copies, from audit-codebase 2026-09-01
  class    one slugify in src/lib/slug.js, 2 readers repointed
  proof    gate green, carrier count 2 -> 0
  commit   3a9e0c1
  next     formatDate reinvented per module, candidate for RF-2
EOF2
git add -A
git -c user.email=f@f -c user.name=fixture commit -qm 'Fixture'

#!/bin/bash
set -e
git init -q
mkdir -p src/orders src/invoices
cat > package.json <<'EOF'
{ "name": "fixture", "version": "0.0.0", "type": "module", "dependencies": { "dayjs": "^1.11.0" } }
EOF
cat > src/orders/format.js <<'EOF'
export function formatDate(d) {
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  return `${day}/${month}/${d.getFullYear()}`
}
export function debounce(fn, ms) {
  let t
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms) }
}
EOF
cat > src/invoices/format.js <<'EOF'
export function formatDate(d) {
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  return dd + '/' + mm + '/' + d.getFullYear()
}
export function debounce(fn, ms) {
  let timer
  return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), ms) }
}
EOF
cat > src/orders/list.js <<'EOF'
import { formatDate } from './format.js'
export async function listOrders(db, customerIds) {
  const out = []
  for (const id of customerIds) {
    const rows = await db.query('SELECT * FROM orders WHERE customer_id = ' + id)
    for (const row of rows) out.push({ ...row, date: formatDate(row.created_at) })
  }
  return out
}
EOF
cat > src/legacy.js <<'EOF'
// export function oldTotal(items) { return items.reduce((s, i) => s + i.price, 0) }
export const FEATURE_NEW_CHECKOUT = true
EOF
git add -A
git -c user.email=f@f -c user.name=fixture commit -qm 'Fixture'

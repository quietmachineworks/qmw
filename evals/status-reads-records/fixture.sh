#!/bin/bash
set -e
git init -q
mkdir -p .qmw/fix-bug/SQ-3 .qmw/refactor .qmw/upgrade-deps src
echo 'export const app = true' > src/index.js
cat > .qmw/fix-bug/log.md <<'EOF'
| ID | Sev | Screen | Report | Status | Seen |
|---|---|---|---|---|---|
| SQ-2 | P2 | /settings | "the save button stays disabled after I change the name" | green | 1 |
| SQ-3 | P1 | /billing | "I paid and the invoice still shows unpaid" | red | 2 |
EOF
cat > .qmw/fix-bug/SQ-3/report.md <<'EOF'
# SQ-3

Report, verbatim: "I paid and the invoice still shows unpaid". Seen twice, 2026-08-28 and 2026-09-02.
Reproduced on 2026-09-02 from a clean session: pay, return to /billing, status reads unpaid until a hard refresh.
Root cause: not established yet.
EOF
cat > .qmw/refactor/log.md <<'EOF'
RF-4  the three date formatters, from audit-codebase 2026-08-20
  class    one formatDate in lib/date.js, 3 readers repointed
  proof    gate green, characterization suite green, carrier count 3 -> 0
  commit   9f3c1a2
  next     the two debounce copies under src/orders and src/invoices, candidate for RF-5
EOF
cat > .qmw/upgrade-deps/log.md <<'EOF'
## Raised

- dayjs 1.10.7 -> 1.11.13, no breaking change met, commit 4b2e7d0

## Held

- express 4.19.2, held at 4: the 5.x migration touches the error middleware in 6 files; price: a /qmw:refactor mandate on the error path first
EOF
git add -A
git -c user.email=f@f -c user.name=fixture commit -qm 'Fixture'

#!/bin/bash
set -e
git init -q
mkdir -p src
cat > CLAUDE.md <<'EOF'
# Conventions

- No `console.log` in application code under `src/`.
- Comments in English.
- Keep functions readable.
EOF
cat > src/a.js <<'EOF'
export function total(items) {
  console.log('computing')
  return items.reduce((sum, item) => sum + item.price, 0)
}
EOF
cat > src/b.js <<'EOF'
// calcule la remise
export const discount = (price) => { console.log(price); return price * 0.9 }
EOF
cat > package.json <<'EOF'
{ "name": "fixture", "version": "0.0.0", "scripts": { "lint": "eslint src" } }
EOF
git add -A
git -c user.email=f@f -c user.name=fixture commit -qm 'Fixture'

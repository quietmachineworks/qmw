#!/bin/bash
set -e
git init -q
mkdir -p src .github/workflows
cat > package.json <<'EOF'
{ "name": "fixture", "version": "0.0.0", "type": "module", "scripts": { "test": "node --test" } }
EOF
for i in 1 2 3; do
  printf 'export function f%s(x) {\n  console.log(x)\n  return x * %s\n}\n' "$i" "$i" > "src/f$i.js"
done
cat > .github/workflows/ci.yml <<'EOF'
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm test
EOF
git add -A
git -c user.email=f@f -c user.name=fixture commit -qm 'Fixture'

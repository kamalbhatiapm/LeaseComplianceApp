#!/usr/bin/env bash
set -e

echo "==> Build start"

# Fail fast with clear message if required var is missing
: "${WEBHOOK_URL:?WEBHOOK_URL env var is not set}"

mkdir -p dist

echo "==> Injecting env vars into HTML"
sed \
  -e "s|__WEBHOOK_URL__|${WEBHOOK_URL}|g" \
  -e "s|__SUPABASE_URL__|${SUPABASE_URL:-}|g" \
  -e "s|__SUPABASE_ANON_KEY__|${SUPABASE_ANON_KEY:-}|g" \
  APP.html > dist/index.html

echo "==> Copying static assets"
cp SAMPLE-LEASE.docx dist/
cp PRD.md dist/

# Verify no placeholders remain
if grep -q "__WEBHOOK_URL__\|__SUPABASE_URL__\|__SUPABASE_ANON_KEY__" dist/index.html; then
  echo "ERROR: unreplaced placeholders found in dist/index.html"
  exit 1
fi

echo "==> Build complete ($(wc -c < dist/index.html | tr -d ' ') bytes)"

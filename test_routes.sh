#!/usr/bin/env bash
set -e
BASE="http://localhost:3000"

echo "== API =="
curl -s --max-time 5 -i "$BASE/tenants/by-domain?host=demo.softellio.com" | head -n 10
curl -s --max-time 5 -i "$BASE/health" | head -n 10

echo "== FRONTEND =="
curl -s --max-time 5 -i "$BASE/" | head -n 10
curl -s --max-time 5 -i "$BASE/some-random-page" | head -n 10

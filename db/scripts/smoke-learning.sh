#!/usr/bin/env bash
set -euo pipefail

base_url="${GENSHU_BASE_URL:-http://localhost:3000}"
tmp_dir="$(mktemp -d)"
trap 'rm -rf "$tmp_dir"' EXIT

curl -fsS "$base_url/materials" > "$tmp_dir/materials.html"
grep -E -q 'Salam dasar dalam bahasa Jepang' "$tmp_dir/materials.html"
curl -fsS "$base_url/materials" > "$tmp_dir/materials-second-client.html"
grep -E -q 'Salam dasar dalam bahasa Jepang' "$tmp_dir/materials-second-client.html"
if grep -E -q 'Contoh materi belum terbit|draft-hidden-example' "$tmp_dir/materials.html"; then
  echo "Draft material leaked into the public catalog" >&2
  exit 1
fi

curl -fsS "$base_url/materials/aisatsu-basics" > "$tmp_dir/material.html"
grep -E -q 'Pagi hari gunakan' "$tmp_dir/material.html"

curl -sS -o "$tmp_dir/draft-material.html" -w '%{http_code}' "$base_url/materials/draft-hidden-example" > "$tmp_dir/material-status"
[[ "$(cat "$tmp_dir/material-status")" == "404" ]]

curl -fsS "$base_url/practice" > "$tmp_dir/practice.html"
grep -E -q 'Kosakata dasar di stasiun' "$tmp_dir/practice.html"
if grep -E -q '非公開練習|draft-hidden-practice' "$tmp_dir/practice.html"; then
  echo "Draft practice leaked into the public catalog" >&2
  exit 1
fi

curl -fsS "$base_url/practice/station-vocabulary-n5" > "$tmp_dir/quiz.html"
grep -E -q 'Tempat untuk menunggu kereta adalah peron' "$tmp_dir/quiz.html"

curl -sS -o "$tmp_dir/draft-practice.html" -w '%{http_code}' "$base_url/practice/draft-hidden-practice" > "$tmp_dir/draft-practice-status"
[[ "$(cat "$tmp_dir/draft-practice-status")" == "404" ]]

status="$(curl -sS -o /dev/null -w '%{http_code}' -X POST -H 'Content-Type: application/json' --data '{"title":"unauthorized"}' "$base_url/api/materials")"
[[ "$status" == "404" ]]

curl -fsS "$base_url/materials" > "$tmp_dir/materials-after-post.html"
if grep -E -q 'Contoh materi belum terbit|draft-hidden-example' "$tmp_dir/materials-after-post.html"; then
  echo "Anonymous write request changed or exposed learning content" >&2
  exit 1
fi

printf '%s\n' "Anonymous published content, hidden drafts, and absent write endpoint checks passed."

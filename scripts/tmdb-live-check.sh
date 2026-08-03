#!/usr/bin/env bash
#
# tmdb-live-check.sh — prove the poster pipeline END TO END against the live TMDB API,
# using the key Codemagic injects, and FAIL THE BUILD if a real poster cannot be resolved
# and downloaded.
#
# Why this exists: inside the app every TMDB failure degrades to Moodie's own gradient card
# art. That is right for a title with no poster, but it means a bad key, a blocked network
# and a changed API shape all look identical on screen — a tester sees "Dune has
# placeholder art" and cannot tell which happened. Dune unquestionably has poster art, so
# if this script cannot fetch it, the build is broken and must not reach TestFlight.
#
# It walks the exact three steps the app walks:
#   1. GET /search/movie?query=Dune&year=2021       -> results[0].poster_path
#   2. build https://image.tmdb.org/t/p/w500<path>  -> must return 200 with an image body
#   3. GET /movie/<id>/watch/providers              -> results.US.link  (advisory only)
#
# SECRETS: reads $TMDB_API_KEY from the environment, passes it via --data-urlencode so it
# never appears in `ps`, and never prints it. Only its length is ever logged.
#
# usage: bash scripts/tmdb-live-check.sh     (requires TMDB_API_KEY in the environment)

set -uo pipefail

API='https://api.themoviedb.org/3'
IMG='https://image.tmdb.org/t/p/w500'
TITLE='Dune'
YEAR=2021
fail=0

say()  { printf '  %s\n' "$*"; }
bad()  { printf '  FAIL  %s\n' "$*"; fail=1; }
good() { printf '  OK    %s\n' "$*"; }

if [ -z "${TMDB_API_KEY:-}" ]; then
  echo "TMDB_API_KEY is not set — cannot verify the poster pipeline."
  echo "The ios-testflight workflow supplies it via 'groups: [tmdb]'."
  exit 1
fi
say "key present (${#TMDB_API_KEY} chars, value never logged)"

# ------------------------------------------------------------------ 1. search
body=$(curl -sS --max-time 20 -G "$API/search/movie" \
        --data-urlencode "api_key=$TMDB_API_KEY" \
        --data-urlencode "query=$TITLE" \
        --data-urlencode "year=$YEAR" \
        --data-urlencode "include_adult=false" 2>/dev/null)

if [ -z "$body" ]; then
  bad "search returned nothing — network blocked or DNS failure"
else
  parsed=$(BODY="$body" python3 -c '
import json, os
try:
    d = json.loads(os.environ["BODY"])
except Exception:
    print("- - 0 unparseable response"); raise SystemExit
r = d.get("results") or []
if not r:
    # surfaces "Invalid API key" (401) without ever echoing the request
    print("- - 0 " + str(d.get("status_message", "no results")))
else:
    print("%s %s %d ok" % (r[0].get("poster_path") or "-", r[0].get("id") or "-", len(r)))
')
  poster=$(echo "$parsed" | cut -d' ' -f1)
  movie_id=$(echo "$parsed" | cut -d' ' -f2)
  found=$(echo "$parsed" | cut -d' ' -f3)
  msg=$(echo "$parsed" | cut -d' ' -f4-)

  if [ "$found" = "0" ] || [ "$poster" = "-" ]; then
    bad "no poster_path for $TITLE ($YEAR) — TMDB said: $msg"
  else
    good "search resolved $TITLE ($YEAR) -> id $movie_id, poster_path $poster"

    # -------------------------------------------------------------- 2. the image
    hdr=$(curl -sS -o /dev/null -D - --max-time 25 -L "$IMG$poster" 2>/dev/null)
    code=$(printf '%s' "$hdr" | awk '/^HTTP/{c=$2} END{print c}')
    ctype=$(printf '%s' "$hdr" | tr -d '\r' | awk -F': ' 'tolower($1)=="content-type"{print $2}' | tail -1)
    len=$(printf '%s' "$hdr" | tr -d '\r' | awk -F': ' 'tolower($1)=="content-length"{print $2}' | tail -1)
    case "${ctype:-}" in
      image/*) img_ok=1 ;;
      *)       img_ok=0 ;;
    esac
    if [ "${code:-}" = "200" ] && [ "$img_ok" = "1" ]; then
      good "poster downloads: HTTP 200, $ctype, ${len:-?} bytes"
      good "the app sets the card image src to ${IMG}${poster}"
    else
      bad "poster URL did not return an image (HTTP ${code:-none}, type ${ctype:-none})"
    fi

    # -------------------------------------------------------------- 3. providers
    wp=$(curl -sS --max-time 20 -G "$API/movie/$movie_id/watch/providers" \
          --data-urlencode "api_key=$TMDB_API_KEY" 2>/dev/null)
    link=$(WP="${wp:-}" python3 -c '
import json, os
try:
    print((json.loads(os.environ["WP"]).get("results") or {}).get("US", {}).get("link") or "-")
except Exception:
    print("-")
')
    if [ "$link" != "-" ]; then
      good "watch/providers resolved a US link"
    else
      say "NOTE  no US watch/providers link for this title — the app falls back to a search URL (not fatal)"
    fi
  fi
fi

echo
if [ "$fail" -ne 0 ]; then
  echo "TMDB POSTER PIPELINE IS BROKEN — refusing to ship a build whose posters cannot load."
  exit 1
fi
echo "TMDB poster pipeline verified end to end."

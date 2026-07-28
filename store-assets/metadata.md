# Moodie — App Store metadata (honest, matches the shipped build)

App: Moodie (ASC app id 6788245223) · bundle com.jonathanbiles.moodie
Status this build: **Free. No account. No in-app purchases yet.** (Moodie+ paid tier is a
fast-follow on ChordLoop's proven StoreKit pattern — do NOT advertise pricing until it ships;
the previous 2.3 rejection was caused by advertising Moodie+ with no IAP present.)

## Name
Moodie: What to Watch

## Subtitle  (≤30 chars)
Pick by mood, decide together

## Promotional text  (≤170)
Never argue about what to watch again. Everyone picks a mood, and Moodie finds the one thing you'll all actually enjoy — with a reason.

## Keywords  (≤100 chars, comma-separated, no spaces)
what to watch,movie night,mood,streaming,tv shows,couples,family,decide,tonight,shuffle,together

## Description
Can't decide what to watch? Moodie picks for you — by how you want to feel.

PICK BY MOOD
Tap a mood or two — Laugh, Chill, Thrills, Romance, Mind-blown, Spooky and more — and Moodie shuffles you one great match, with a one-line reason why. Tell Moodie which services you use and it matches against those first, then "Where to watch" opens a live search so you can see who actually has it tonight.

DECIDE TOGETHER (no accounts, works offline)
This is the part nobody else does. Pass the phone around: everyone taps how THEY want to feel, and Moodie finds the one title that works for the whole room — then shows you why each person is happy with it. Two people on the couch or the whole family. If nobody overlaps, Moodie is honest about it and finds the closest match instead.

KID-SAFE WHEN YOU NEED IT
Set an optional content limit so family picks stay appropriate.

SAVE FOR LATER
Keep a lightweight watch-later list.

Free. No sign-up. Nothing to configure. Just open it and decide.

## What's New (this version)
Watch together, for real: pass the phone, everyone picks a mood, and Moodie finds the one thing you'll all enjoy — with a reason for each person. Plus more titles to match on, and full iPad support.

## Notes for App Review
See `REVIEW-NOTES.md` in the repo root for the full text to paste into App Store Connect.
Summary:
- Free app, no account or login required — fully usable on first launch.
- No in-app purchases in this version, and nothing in the build advertises a paid tier.
- "Together" uses on-device logic only — no server, no accounts, no network calls for pairing.
  Person names are optional free-text inputs defaulting to "Person 1…N"; there are no demo members.
- The app DOES use the network: anonymous read-only Wikipedia API calls for poster art and
  synopses. Everything else works offline (posters fall back to gradient cards).
- "Where to watch" opens a live JustWatch search in the system browser — the app never claims a
  title is on a given service right now.
- Native features: haptics, native iOS share sheet, on-device storage, in-app system browser;
  universal (iPhone + iPad).
- Contact: jonathanbbiles@gmail.com

# Moodie — App Store metadata (honest, matches the shipped build)

App: Moodie (ASC app id 6788245223) · bundle com.jonathanbiles.moodie
Status this build: **Free. No account. No in-app purchases yet.** (Moodie+ paid tier is a
fast-follow on ChordLoop's proven StoreKit pattern — do NOT advertise pricing until it ships;
the earlier 2.3 rejection was caused by advertising Moodie+ with no IAP present.)

> **2026-08-01 — 4.1(a) remediation.** The listing was rejected under Guideline 4.1(a)
> (Copycats) for third-party content in metadata: the screenshots carried real copyrighted
> poster art, real film titles, provider brand badges and Wikipedia synopsis text. Both the
> listing AND the app were changed. The app no longer fetches or displays any third-party
> artwork or text, shows a neutral "On your services" badge instead of provider names, and
> makes no runtime network requests. The name dropped "What to Watch". Every field below is
> trademark-clean. **`fastlane/metadata/en-US/*.txt` is the source of truth — this file is a
> readable mirror of it. Edit the .txt files, not this.**

## Name  (≤30)
Moodie: Pick by Mood

## Subtitle  (≤30)
Movie night, decided together

## Promotional text  (≤170)
Can't decide what to watch? Tell Moodie how you want to feel and it picks one thing — for you, or for the whole room. No sign-up, no accounts, nothing to set up.

## Keywords  (≤100 chars, comma-separated, no spaces)
what to watch,tv,shows,series,film,streaming,watchlist,couples,family,kids,tonight,shuffle,picker

## Description
Can't decide what to watch? Moodie picks for you — by how you want to feel.

PICK BY MOOD
Tap a mood or two — Laugh, Chill, Thrills, Romance, Mind-blown, Spooky and more — and Moodie shuffles you one great match, with a one-line reason why. Tell Moodie which streaming services you use and it matches against those first, then "Where to watch" opens a live web search so you can see who actually has it tonight.

DECIDE TOGETHER (no accounts, no server)
This is the part nobody else does. Pass the phone around: everyone taps how THEY want to feel, and Moodie finds the one title that works for the whole room — then shows you why each person is happy with it. Two people on the couch or the whole family. If nobody overlaps, Moodie is honest about it and finds the closest match instead. It all runs on your device.

KID-SAFE WHEN YOU NEED IT
Set an optional content limit so family picks stay appropriate.

SAVE FOR LATER
Keep a lightweight watch-later list.

PRIVATE BY DEFAULT
Your moods, saved titles and settings stay on your device. No tracking, no ads, no analytics, no data sold.

Free. No sign-up. Nothing to configure. Just open it and decide.

Moodie is an independent app. It is not affiliated with, endorsed by, or connected to any streaming service or media company, and it does not stream or play any video. Titles and artwork shown in App Store images are illustrative samples.

## What's New (this version)
Moodie now draws every card with its own artwork, so the app carries no third-party media and makes no outside requests while you use it. Plus the same one-tap mood picking, pass-the-phone group picks, and a lighter, faster feel throughout.

## Notes for App Review
See `REVIEW-NOTES.md` in the repo root for the full text; `fastlane/metadata/review_information/notes.txt`
is the generated plain-text copy that `deliver` uploads. Summary:
- Free app, no account or login required — fully usable on first launch.
- No in-app purchases in this version, and nothing in the build advertises a paid tier.
- **No third-party media.** No bundled or fetched poster art, no third-party synopsis text,
  no provider logos or marks on content, and **zero runtime network requests** — the app
  works fully offline. Service names appear only in the optional "Your services" picker,
  describing the user's own subscriptions.
- "Together" uses on-device logic only — no server, no accounts, no network calls for pairing.
- "Where to watch" opens a public availability search in the system browser, user-initiated.
- App Store screenshots use original placeholder titles and the app's own card art.
- Native features: haptics, native iOS share sheet, on-device storage, in-app system browser;
  universal (iPhone + iPad).
- Contact: jonathanbbiles@gmail.com

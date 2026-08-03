# Moodie — App Store metadata (honest, matches the shipped build)

App: Moodie (ASC app id 6788245223) · bundle com.jonathanbiles.moodie
Status this build: **Free. No account. No in-app purchases yet.**

> **2026-08-02 — posters restored via TMDB.** Artwork, synopses and where-to-watch links now
> come from the TMDB API (watch providers powered by JustWatch), replacing the Wikipedia
> scraping that drew the 4.1(a) / IP problem. Required attributions are shown in-app. No
> provider logos or brand badges anywhere in the UI. **App Store screenshots stay poster-free**
> — real studio key art in marketing is what triggered 4.1(a), and TMDB's terms cover
> in-app display, not our store listing. **`fastlane/metadata/en-US/*.txt` is the source of
> truth — this file is a readable mirror. Edit the .txt files, not this.**

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
Tap a mood or two — Laugh, Chill, Thrills, Romance, Mind-blown, Spooky and more — and Moodie shuffles you one great match, with a one-line reason why. Tell Moodie which streaming services you use and it matches against those first, then "Where to watch" opens a live availability search so you can see who actually has it tonight.

DECIDE TOGETHER (no accounts, no server)
This is the part nobody else does. Pass the phone around: everyone taps how THEY want to feel, and Moodie finds the one title that works for the whole room — then shows you why each person is happy with it. Two people on the couch or the whole family. If nobody overlaps, Moodie is honest about it and finds the closest match instead. The matching all runs on your device.

KID-SAFE WHEN YOU NEED IT
Set an optional content limit so family picks stay appropriate.

SAVE FOR LATER
Keep a lightweight watch-later list.

PRIVATE BY DEFAULT
There's no account and nothing to sign up for. Your moods, your saved list and your chosen services stay on your device — Moodie has no profile of you and syncs nothing. To show you a poster and a synopsis, it asks TMDB about the title on screen; that lookup is the only thing Moodie ever sends anywhere. No tracking, no ads, no analytics, no data sold.

Free. No sign-up. Nothing to configure. Just open it and decide.

Moodie is an independent app. It is not affiliated with, endorsed by, or connected to any streaming service or media company, and it does not stream or play any video. Titles and artwork shown in App Store images are illustrative samples.

This product uses the TMDB API but is not endorsed or certified by TMDB.

## What's New (this version)
Posters and synopses are back — now sourced properly from TMDB, with where-to-watch links powered by JustWatch. No streaming-service logos, no scraped artwork. Plus the same one-tap mood picking and pass-the-phone group picks.

## Notes for App Review
See `REVIEW-NOTES.md`; `fastlane/metadata/review_information/notes.txt` is the generated
plain-text copy `deliver` uploads. Summary:
- Free app, no account or login required — fully usable on first launch.
- No in-app purchases in this version, and nothing in the build advertises a paid tier.
- Artwork + synopses from TMDB; where-to-watch via TMDB's JustWatch-powered
  /watch/providers. Both credits rendered in-app (licence conditions).
- No provider logos or brand marks in our UI; picks carry a neutral "On your services" badge.
- Network use is a title lookup to TMDB only. Offline, cards fall back to the app's own
  gradient art and everything else keeps working.
- Screenshots use original placeholder titles and the app's own card art.
- Contact: jonathanbbiles@gmail.com

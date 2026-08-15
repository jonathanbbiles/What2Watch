# Moodie — App Review notes (paste into App Store Connect → App Review Information → Notes)

Moodie helps you decide what to watch tonight. Pick how you want to feel, tap Shuffle, and
Moodie suggests one title — with a one-line reason why — then hands off to a live
"where to watch" search so you can see which service actually has it right now.

## Third-party content — please read first

This build was changed specifically to address the previous 4.1(a) rejection. What changed:

- **Artwork and synopses now come from TMDB (The Movie Database)** via its public API, under
  terms that permit displaying them in an app like this. The earlier build scraped key art
  and article text from the Wikipedia API — that code has been removed entirely, and none of
  that content remains.
- **The "where to watch" hand-off uses TMDB's /watch/providers endpoint**, which is powered
  by JustWatch, rather than a hand-built search URL.
- **Required credits are shown in the app**, because they are licence conditions:
  "This product uses the TMDB API but is not endorsed or certified by TMDB." and
  "Where-to-watch data provided by JustWatch." Both appear on the You screen, and both are
  repeated on each pick screen where that data is displayed.
- **No provider logos or brand marks anywhere in our UI.** A pick carries a neutral
  "On your services" badge. Moodie has no licensed availability feed of its own, so it never
  claims a title is on a particular service. Provider names and logos are available in the
  TMDB response and are deliberately not rendered.
- **Moodie bundles no media.** Nothing is stored or redistributed; images are loaded from
  TMDB's own image CDN at display time.

Streaming service names appear in exactly one place — the optional "Your services" picker,
where you tell Moodie which services you subscribe to so it can match against them. That is
plain text describing the user's own subscriptions, with no logos or marks. Moodie is not
affiliated with, endorsed by, or connected to any of them.

**App Store images:** the screenshots are rendered from the shipping build itself (see
`store-assets/render_screenshots.mjs`), showing the app's **own generated gradient card
art** — no TMDB artwork, no studio key art, no provider logos anywhere in the store listing.
Title names appear only as plain text, exactly as the on-device catalog stores them.

  > Regenerated for this build. The previous set predated the 4.1(a) remediation and still
  > showed downloaded theatrical key art and verbatim encyclopedic synopsis text — i.e. the
  > listing still carried the very content the notes said had been removed. Screenshots are
  > metadata, so that mismatch is a 4.1(a)/2.3.3 exposure on its own.

## Network use
Moodie calls the TMDB API to fetch a poster and synopsis for the title on screen, and to
resolve its where-to-watch link. The request contains only the title being looked up — no
user data, identifiers, or analytics. Everything else (moods, shuffling, Together, Saved) is
computed on device. If the device is offline or TMDB is unreachable, posters fall back to
Moodie's own gradient card art, the synopsis is hidden, and every other feature keeps
working normally.

## Account / purchases
- No account, login, or sign-up. The app is fully usable on first launch; there is no gated content.
- The app is FREE. There are **no in-app purchases and no subscriptions in this version**, and
  nothing in the app advertises, mentions, or previews a paid tier.
- No demo credentials are needed.

## What a reviewer will see (every screen in the build)
1. **Welcome** — intro, "Let's go".
2. **Your services** — tap which streaming services you use (purely a local preference; see above).
3. **A peek at the catalog** — an optional, skippable browse of some of the titles Moodie
   picks from. Nothing here is stored or required.
4. **Shuffle (Home)** — the mood grid; tap one or more moods, then "Shuffle my pick".
5. **Your pick** — the suggested title, why it matched, its synopsis, and the buttons
   "Where to watch", "Save", "Again", "Share".
6. **Together** — pass-the-phone group picking: choose how many people (2–6), optionally name them,
   optionally set a content-rating limit, then each person taps their moods in turn and Moodie shows
   the one title with the best overlap plus who it satisfies. The matching is entirely on-device;
   no accounts, no server, no invites, no example/demo members.
7. **Saved** — watch-later grid; tapping a card opens its "where to watch" search.
8. **You** — the services you picked, a link to Together, links to Privacy Policy and Support,
   and the TMDB / JustWatch attributions.

## Streaming availability — please note
Moodie ships a small curated catalog (45 titles) on-device, as plain text. It does **not**
claim a title is streaming on a particular service right now — streaming rights move
constantly. That is why a pick is badged only "On your services", reflecting the services
*you* selected as what Moodie matched against. The "Where to watch" button opens the
JustWatch page for that title, resolved through TMDB, in the system browser
(SFSafariViewController) — that is what shows the real, current list of services.

## Native features (beyond a web page)
- Haptic feedback (Taptic Engine) when picking a mood, shuffling, and revealing a match.
- Native iOS Share sheet to share a pick.
- On-device storage (Capacitor Preferences) persists your services and saved list.
- In-app system browser (Capacitor Browser / SFSafariViewController) for the "where to watch"
  handoff and the Privacy / Support links.
- Universal — iPhone and iPad.

## Privacy
No accounts, no tracking, no ads, no analytics SDKs, no third-party data collection. Moods,
saved titles, and selected services stay on the device. The only outbound data is the title
being looked up, sent to TMDB to fetch its poster, synopsis and availability link.
Privacy Policy: https://jonathanscribbles.com/moodie#privacy

Contact: jonathanbbiles@gmail.com

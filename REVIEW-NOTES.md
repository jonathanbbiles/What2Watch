# Moodie — App Review notes (paste into App Store Connect → App Review Information → Notes)

Moodie helps you decide what to watch tonight. Pick how you want to feel, tap Shuffle, and
Moodie suggests one title — with a one-line reason why — then hands off to a live
"where to watch" search so you can see which service actually has it right now.

## Third-party content — please read first

This build was changed specifically to address the previous 4.1(a) rejection. Moodie now
contains **no third-party media of any kind**:

- **No artwork.** Every card is drawn by the app itself from a gradient and a glyph. Moodie
  bundles no poster images and downloads none. An earlier build fetched poster art from the
  public Wikipedia API — that code has been removed entirely.
- **No third-party text.** The earlier build also showed a synopsis fetched from Wikipedia.
  That feature and its UI have been removed. The only description text on a pick is a
  one-line "why it matched" written by us.
- **No provider names or marks on content.** A pick shows a neutral "On your services"
  badge. Moodie has no licensed availability feed and no relationship with any provider, so
  it never claims a title is on a particular service.
- **No runtime network requests.** While you use it, Moodie makes zero outbound requests.
  It works fully offline. The only network activity is user-initiated: tapping "Where to
  watch", or the Privacy / Support links, opens the system browser.

Streaming service names do appear in one place — the optional "Your services" picker, where
you tell Moodie which services you subscribe to so it can match against them. That is a
plain-text list used to describe the user's own subscriptions; Moodie is not affiliated
with, endorsed by, or connected to any of them, and displays no provider logos or marks.

**App Store images:** the screenshots use original placeholder titles and the app's own card
art rather than titles from the catalog, so that no third-party name appears in our store
listing. Layout and UI are identical to the shipped app.

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
5. **Your pick** — the suggested title, why it matched, and the buttons
   "Where to watch", "Save", "Again", "Share".
6. **Together** — pass-the-phone group picking: choose how many people (2–6), optionally name them,
   optionally set a content-rating limit, then each person taps their moods in turn and Moodie shows
   the one title with the best overlap plus who it satisfies. Entirely on-device; no accounts,
   no server, no invites, no example/demo members.
7. **Saved** — watch-later grid; tapping a card opens its "where to watch" search.
8. **You** — the services you picked, a link to Together, and links to Privacy Policy and Support.

## Streaming availability — please note
Moodie ships a small curated catalog (45 titles) on-device, as plain text. It does **not**
claim a title is streaming on a particular service right now — streaming rights move
constantly and Moodie has no licensed availability feed. That is why a pick is badged only
"On your services", reflecting the services *you* selected as what Moodie matched against.
The "Where to watch" button opens a public availability search for that title in the system
browser (SFSafariViewController), which is what shows the real, current list of services.
This is the app's only content-related outbound link, and it is always user-initiated.

## Native features (beyond a web page)
- Haptic feedback (Taptic Engine) when picking a mood, shuffling, and revealing a match.
- Native iOS Share sheet to share a pick.
- On-device storage (Capacitor Preferences) persists your services and saved list.
- In-app system browser (Capacitor Browser / SFSafariViewController) for the "where to watch"
  handoff and the Privacy / Support links.
- Universal — iPhone and iPad.

## Privacy
No accounts, no tracking, no ads, no analytics SDKs, no third-party data collection, and no
runtime network requests. Moods, saved titles, and selected services stay on the device.
Privacy Policy: https://jonathanscribbles.com/moodie#privacy

Contact: jonathanbbiles@gmail.com

# Moodie — App Review notes (paste into App Store Connect → App Review Information → Notes)

Moodie helps you decide what to watch tonight. Pick how you want to feel, tap Shuffle, and
Moodie suggests one title — with a one-line reason why — then hands off to a live
"where to watch" search so you can see which service actually has it right now.

## Account / purchases
- No account, login, or sign-up. The app is fully usable on first launch; there is no gated content.
- The app is FREE. There are **no in-app purchases and no subscriptions in this version**, and
  nothing in the app advertises, mentions, or previews a paid tier.
- No demo credentials are needed.

## What a reviewer will see (every screen in the build)
1. **Welcome** — intro, "Let's go".
2. **Your services** — tap which streaming services you use (purely a local preference; see note below).
3. **A peek at the catalog** — an optional, skippable browse of some of the titles Moodie
   picks from. Nothing here is stored or required.
4. **Shuffle (Home)** — the mood grid; tap one or more moods, then "Shuffle my pick".
5. **Your pick** — the suggested title, why it matched, a synopsis, and the buttons
   "Where to watch", "Save", "Again", "Share".
6. **Together** — pass-the-phone group picking: choose how many people (2–6), optionally name them,
   optionally set a content-rating limit, then each person taps their moods in turn and Moodie shows
   the one title with the best overlap plus who it satisfies. Entirely on-device; no accounts,
   no server, no invites, no example/demo members.
7. **Saved** — watch-later grid; tapping a card opens its "where to watch" search.
8. **You** — the services you picked, a link to Together, and links to Privacy Policy and Support.

## Streaming availability — please note
Moodie ships a small curated catalog (45 titles) on-device. It does **not** claim a title is
streaming on a particular service right now — streaming rights move constantly and Moodie has no
licensed availability feed. The service name shown on a pick reflects the services *you* selected,
which is what Moodie matched against. The "Where to watch" button opens a live JustWatch search for
that title in the system browser (SFSafariViewController), which is what shows the real, current
list of services. This is the app's only outbound link.

## Network use
Moodie is not an offline-only app. It makes anonymous, read-only requests to the public
Wikipedia API (`en.wikipedia.org`) to fetch poster artwork and a short synopsis for each title.
No user data, identifiers, or analytics are sent — the request contains only the title name.
If the device is offline, posters fall back to on-brand gradient cards, the synopsis is hidden,
and every other feature (moods, shuffle, Together, Saved) continues to work normally.

## Native features (beyond a web page)
- Haptic feedback (Taptic Engine) when picking a mood, shuffling, and revealing a match.
- Native iOS Share sheet to share a pick.
- On-device storage (Capacitor Preferences) persists your services and saved list.
- In-app system browser (Capacitor Browser / SFSafariViewController) for the "where to watch"
  handoff and the Privacy / Support links.
- Universal — iPhone and iPad.

## Privacy
No accounts, no tracking, no ads, no analytics SDKs, no third-party data collection.
Moods, saved titles, and selected services stay on the device.
Privacy Policy: https://jonathanscribbles.com/moodie#privacy

Contact: jonathanbbiles@gmail.com

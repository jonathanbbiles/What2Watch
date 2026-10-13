# What2Watch — Moodie

Moodie: what to watch tonight, by mood. iOS app wrapped with Capacitor.

Built and signed in the cloud with Codemagic (see `codemagic.yaml`) and delivered to TestFlight / App Store Connect (app id 6788245223, bundle `com.jonathanbiles.moodie`).

## Big screens (1.2)

Moodie is universal (iPhone + iPad, all four iPad orientations — `codemagic.yaml` writes and
reads them back). `www/index.html` "Big screens" CSS: below 600pt nothing changes; 600pt+
(iPhone Duo open, iPad portrait) uses the full width; 860pt+ changes shape (five-across mood
wall, two-column You and Together setup, and — when wider than tall — poster beside the pick).

    npm install --no-save playwright-core
    PW_EXEC=/path/to/chromium npm run layout -- /tmp/moodie-layout

renders every screen at iPhone, Duo (closed/open/sideways) and iPad 11"/13" (both ways), and
fails on sideways scroll or an unreachable last control. Needs a browser, so it is not in
`npm test` (which is the listing lint). The 13" iPad App Store set is rendered on every build
by `store-assets/render_shots_1_1.mjs` and uploaded by `fastlane deliver`.

## Shipping to App Review (`release` lane)

Committing `release.json` to `main` **is** the ship; nothing else submits. The `release`
workflow in `codemagic.yaml` (ported from Slow Burn) acts only when that push changed
`release.json`, re-renders the store screenshots (iPhone 6.9", 6.5", iPad 13" into
`fastlane/screenshots/en-US`), then `scripts/release.py` creates the version record if it is
missing, attaches the build, writes What's New from `release-notes/<version>.txt`, uploads the
sets and submits, reading the submission back first. The contract is the docstring at the top
of `scripts/release.py`; `npm test` runs `scripts/verify-release.js`, which drives the lane
against a fake App Store Connect.

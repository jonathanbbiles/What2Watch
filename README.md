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

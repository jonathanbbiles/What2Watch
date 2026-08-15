# Submitting to the App Store without a browser

No App Store Connect login. No 2FA. No session that logs you out mid-submission. The
listing lives in this repo, and Codemagic pushes it to Apple with the App Store Connect API
key that is already stored in Codemagic.

---

## The one line that submits the app

```bash
scripts/cm-build.sh --submit --watch
```

That starts a Codemagic build with `SUBMIT_FOR_REVIEW=true` for this build only. The build
compiles the app, ships it to TestFlight, uploads the listing from `fastlane/`, attaches the
build to the editable App Store version, and submits it for review.

`SUBMIT_FOR_REVIEW` is deliberately **not** written anywhere in `codemagic.yaml`. A push to
`main` cannot submit anything, because the variable simply is not there. The safe state is
the default rather than something to remember to switch back.

`--watch` needs `CODEMAGIC_API_TOKEN`. Without it, `--submit` cannot be used either — see
"If you have no Codemagic API token" below.

### The other two modes

| What you want | How |
|---|---|
| Prove the key still works, change nothing | happens automatically on every push to `main` |
| Upload metadata + screenshots, don't submit | `scripts/cm-build.sh --env ASC_LISTING_MODE=push --watch` |
| Upload the listing **and** submit for review | `scripts/cm-build.sh --submit --watch` |

---

## The guard: why this is safe to leave wired up

Before writing anything, the lane asks Apple what state this app's App Store versions are
in, and **refuses unless a version is editable**:

- editable → `PREPARE_FOR_SUBMISSION`, `DEVELOPER_REJECTED`, `REJECTED`, `METADATA_REJECTED`,
  `INVALID_BINARY`
- refused → `WAITING_FOR_REVIEW`, `IN_REVIEW`, `PENDING_APPLE_RELEASE`,
  `PENDING_DEVELOPER_RELEASE`, and anything else

So while Moodie is in review, a `push` or `submit` stops with a message naming the state
instead of editing a live submission. If the state cannot be read at all, the lane **also**
refuses — unknown means no. `ASC_ALLOW_UNVERIFIED_STATE=true` overrides that, and is for
when Apple's API is the thing that is broken.

The default mode, `validate`, never writes at all, which is why it is safe to run on every
single build of an app that is mid-review.

---

## How to lay the listing out

```
fastlane/
  Appfile                       app_identifier only — no Apple ID, no secrets
  Fastfile                      the lane; identical across every app in the portfolio
  metadata/
    en-US/
      name.txt                  <= 30 characters
      subtitle.txt              <= 30 characters
      keywords.txt              <= 100 characters, comma separated, NO space after commas
      promotional_text.txt      <= 170 characters (editable without a new version)
      description.txt           <= 4000 characters
      release_notes.txt         "What's New" for this version
      support_url.txt           required
      privacy_url.txt           required
      marketing_url.txt         optional
    review_information/
      first_name.txt  last_name.txt  email_address.txt  phone_number.txt   all required
      notes.txt                 reviewer notes — where you pre-empt the rejection
  screenshots/
    en-US/
      iphone-6-9-01-....png     1290x2796 or 1320x2868
      iphone-6-5-01-....png     1242x2688 or 1284x2778
      ipad-13-01-....png        2048x2732 or 2064x2752
```

Two things about screenshots that cost a review cycle when you get them wrong:

- **deliver picks the App Store slot from the file's pixel size, not its filename.** A file
  of the wrong size is silently ignored, and the slot it should have filled ends up empty.
- **Ordering comes from the `NN-` number in the filename**, which is why every name starts
  with one.

The lane checks all of this locally, before touching the network, and fails with the exact
field and character count. Run that check on its own — it needs no fastlane and no network:
`ruby scripts/lint_listing.rb`.

### An iPhone-only app still needs iPad screenshots if it is Universal

`TARGETED_DEVICE_FAMILY=1` removes the iPad **screenshot requirement**, not the iPad
**review**. Moodie is Universal, so the 13" iPad set above is mandatory.

---

## Validating a change to this pipeline without submitting anything

Push a branch whose name starts with `asc-validate`:

```bash
git switch -c asc-validate-<what-you-changed>
git push -u origin HEAD
```

Only the `asc-listing-validate` workflow triggers on that pattern. It builds nothing, signs
nothing, and writes nothing — it runs ten read-only steps, each able to fail for exactly one
reason. **The check run carries step names and outcomes but not log text, so which step went
red is the diagnosis:**

| Red step | What it means |
|---|---|
| `0/9 Toolchain` | fastlane isn't on the image, or the listing files aren't where they should be |
| `1/9 Fastfile parses` | Ruby error in the lane |
| `2/9 Listing lint` | a field is over length, a file is missing, or a screenshot is the wrong size |
| `3/9 ASC credentials` | the key's variables aren't exported into the build |
| `4/9 Apple accepts the key` | key id, issuer id, or the key's **role** is wrong |
| `5/9 Ruby can handle EC keys` | the image's OpenSSL can't do EC at all — fastlane could never work there |
| `6/9 key-shaped material` | no usable key in the variable **or** on disk |
| `7/9 private key usable` | key material exists but nothing parses it |
| `8/9 fastlane assembles the key` | fastlane can't build the credential (helper file, key shape) |
| `9/9 THE AUTHORITY` | the real lane — fastlane's own auth or the version-state read failed |

Read it without a browser and without a Codemagic token:

```bash
gh api repos/jonathanbbiles/What2Watch/commits/<sha>/check-runs \
  --jq '.check_runs[] | {name, conclusion, text: .output.text}'
```

### Where the key actually lives — the thing that cost a dozen runs

`APP_STORE_CONNECT_PRIVATE_KEY` is exported into the build, but on this Codemagic image it
does **not** contain the key. Codemagic writes the `.p8` to
`~/.appstoreconnect/private_keys/`, and its own `app-store-connect` CLI looks there without
being told. So the CLI authenticates fine while fastlane — handed only the variable — fails,
with the same key, in the same build. That is why this looked like a bad key for so long.

`scripts/asc_key_pem.rb` handles it: it tries the variable in every shape it might take
(PEM, escaped newlines, base64, bare base64 body, a path) **and** the standard key
directories, and keeps whichever one OpenSSL actually parses as an EC key. It does not
classify — it verifies, then re-serialises to PEM so fastlane always gets the same thing.
Run it on its own in any build: `ruby scripts/asc_key_pem.rb` (prints the shape, never the
key).

**Validated 2026-08-15 on `jonathanbbiles/What2Watch`, branch `asc-validate-listing-lane`:
all ten steps green, including the real lane authenticating against App Store Connect and
reading Moodie's version state. Nothing was uploaded and nothing was submitted.**

---

## If you have no Codemagic API token

`scripts/cm-build.sh` (and therefore `--submit`) needs `CODEMAGIC_API_TOKEN`. It is not
configured on this machine, so today the only token-free trigger is a branch push, and the
only branch that submits is none of them — by design.

To get the one-line submit working:

1. Codemagic → avatar → Personal settings → Integrations → Codemagic API → generate a token.
2. `echo 'export CODEMAGIC_API_TOKEN="…"' >> ~/.zshrc && source ~/.zshrc`
3. `scripts/cm-build.sh --list-apps` to confirm.

Until then, a submit has to be started from the Codemagic UI by adding
`SUBMIT_FOR_REVIEW=true` to the build's environment.

---

## Version and build numbers — do not regress these

Set in `codemagic.yaml`, in the "Set marketing version + build number" step:

- `CFBundleShortVersionString` is pinned to **`1.0`**, because that is literally the version
  string App Store Connect has. `deliver` attaches the build to the editable version; a build
  stamped `1.0.0` can never attach to ASC version `1.0`, and the submit waits until it times
  out. When the ASC version changes, change this in the same commit.
- `CFBundleVersion` is `date -u +%Y%m%d%H%M` — a UTC timestamp. Always increases, never
  collides, and needs no round-trip to Apple to work out "the last one plus one". Never use
  "latest + 1".

---

## The compliance answers

Declared in `codemagic.yaml` as `ASC_USES_ENCRYPTION` / `ASC_CONTENT_RIGHTS` /
`ASC_USES_IDFA`, and sent with the submission. They are declarations about the shipped
build, not defaults — for Moodie, third-party content is **true** because the app displays
TMDB poster artwork and synopsis text at runtime.

## Secrets

The App Store Connect key is never in this repo. It reaches the build only as
`APP_STORE_CONNECT_KEY_IDENTIFIER` / `APP_STORE_CONNECT_ISSUER_ID` /
`APP_STORE_CONNECT_PRIVATE_KEY`, injected by Codemagic from
`integrations: app_store_connect: ChordLoopAPIKey`. Everything in this pipeline reports
those by name and never prints a value. If a step says one is MISSING, the fix is to add the
same key as three **Secure** environment variables on the app in the Codemagic UI — Jonathan
does that himself.

# frozen_string_literal: true
#
# asc_key_pem.rb — normalise the App Store Connect private key into PEM text.
#
# WHY THIS EXISTS
# Codemagic injects the key as APP_STORE_CONNECT_PRIVATE_KEY, but not always in the same
# shape. Its own `app-store-connect` CLI accepts every shape, so the CLI authenticates
# happily while fastlane does not — which looks exactly like a bad key and is not one.
# Three shapes turn up in practice:
#
#   1. PEM text                       -----BEGIN PRIVATE KEY----- … with real newlines
#   2. PEM with escaped newlines      the same, but "\n" as two literal characters
#   3. base64-encoded PEM             the whole .p8 file base64'd into one line
#   4. a path to the .p8 on disk      some integrations write the key out and export where
#
# fastlane's `app_store_connect_api_key` takes `is_key_content_base64`, a single boolean,
# which cannot express "it might be any of these". So this normalises to shape 1 and the
# Fastfile always passes `is_key_content_base64: false`.
#
# ONE SOURCE OF TRUTH. The Fastfile requires this file, and CI runs it directly as a probe:
#
#     ruby scripts/asc_key_pem.rb        exit 0 + print the SHAPE, never the key
#
# THE KEY IS NEVER PRINTED, never written to disk, and never passed on a command line —
# only its shape and length. Build logs are not private.

# No `require "base64"`. String#unpack1("m") is base64 decoding built into the language,
# with no gem behind it — and base64 stopped being a default gem in newer Rubies, so the
# require is exactly the kind of thing that fails on a build image and nowhere else.
ASC_PEM_MARKER = "-----BEGIN"

# Returns [pem_text, shape_description], or nil when the value is not a key in any shape.
def asc_private_key_pem(raw = ENV["APP_STORE_CONNECT_PRIVATE_KEY"])
  raw = raw.to_s
  return nil if raw.strip.empty?

  # Some setups store the value quoted; the quotes then travel into the key text.
  trimmed = raw.strip.gsub(/\A["']|["']\z/, "")

  # Shape 4: a path to the .p8 rather than its contents.
  if trimmed.length < 4096 && !trimmed.include?("\n") && File.file?(trimmed)
    contents = begin
      File.read(trimmed)
    rescue StandardError
      nil
    end
    return [contents, "read from the file at that path"] if contents&.include?(ASC_PEM_MARKER)
  end

  if raw.include?(ASC_PEM_MARKER)
    # Careful: a key whose newlines were escaped STILL contains the BEGIN marker, so
    # matching on the marker alone hands back a one-line "PEM" that no parser accepts.
    # Real PEM is at least three lines; anything shorter that carries literal \n is escaped.
    return [raw.gsub('\n', "\n"), "PEM text with escaped newlines"] if raw.lines.count < 3 && raw.include?('\n')

    return [raw, "PEM text"]
  end

  begin
    decoded = trimmed.unpack1("m").to_s.force_encoding("UTF-8")
    return [decoded, "base64-encoded PEM"] if decoded.include?(ASC_PEM_MARKER)
  rescue StandardError # rubocop:disable Lint/SuppressedException
    # Not base64. Fall through to the failure below.
  end

  nil
end

# Run directly: classify the key that is in the environment and say so, without ever
# revealing it. Exit 1 if it is not a key in any recognised shape.
if $PROGRAM_NAME == __FILE__
  raw = ENV["APP_STORE_CONNECT_PRIVATE_KEY"].to_s
  if raw.strip.empty?
    puts "FATAL: APP_STORE_CONNECT_PRIVATE_KEY is empty."
    puts "It comes from `integrations: app_store_connect:` in codemagic.yaml, or from three"
    puts "Secure environment variables on the app in the Codemagic UI."
    exit 1
  end

  result = asc_private_key_pem(raw)
  if result.nil?
    puts "FATAL: APP_STORE_CONNECT_PRIVATE_KEY is #{raw.length} characters but is not a private"
    puts "key in any recognised shape (PEM, PEM with escaped newlines, or base64 PEM)."
    puts "Re-add it in Codemagic by pasting the .p8 file contents verbatim, BEGIN/END included."
    exit 1
  end

  pem, shape = result
  puts "key shape:  #{shape}"
  puts "PEM lines:  #{pem.lines.count}   (a .p8 has about 5)"
  puts "begins:     #{pem.lines.first.to_s.strip}"
  puts "normalised to PEM text — the Fastfile passes is_key_content_base64: false"
  exit 0
end

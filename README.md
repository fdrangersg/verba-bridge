# VerbaBridge

Real-time bilingual subtitle system for sacrament meetings.

Pipeline:

Audio Input -> Google Streaming ASR (with phrase hints) -> Google Translation -> WebSocket Broadcast -> Browser Display

This repo is intentionally minimal, layered, and maintainable.

## Features

- Live microphone capture from mixer/audio interface
- Streaming speech recognition with Google Cloud Speech-to-Text
- Direction switching:
  - `EN_TO_ZH` (English -> Chinese)
  - `ZH_TO_EN` (Chinese -> English)
- Glossary-driven ASR phrase hints from `config/glossary.csv` (improves recognition of proper nouns)
- Optional Cloud Translation glossary for server-side term consistency
- Local WebSocket broadcast + browser subtitle display
- Simple control panel:
  - Start/Stop session
  - Direction switch
  - Connection status
  - Approximate latency
- Per-session plain-text transcript saved to `recordings/` for post-meeting review

## Project Structure

```text
verba-bridge/
  src/
    asr/
      googleStreamingAsr.js
    translation/
      googleTranslator.js
    glossary/
      glossaryLoader.js
      glossaryHints.js
    websocket/
      subtitleHub.js
    recorder/
      transcriptRecorder.js
    session/
      sessionController.js
    constants.js
    config.js
    server.js
  public/
    index.html
  config/
    glossary.csv
  .env.example
  package.json
  README.md
```

## Prerequisites

- Node.js 18+
- npm 9+
- Google Cloud project
- Local audio capture tool supported by `node-record-lpcm16`:
  - macOS: `sox`
  - Linux: `arecord` or `sox`

Example (macOS):

```bash
brew install sox
```

## 1. Google Cloud Setup

1. Create/select a Google Cloud project.
2. Enable APIs:
   - `Cloud Speech-to-Text API`
   - `Cloud Translation API`
3. Create a service account.
4. Grant roles (minimum practical set):
   - `Cloud Speech Client`
   - `Cloud Translation API User`
5. Create and download a JSON key.
6. Set `GOOGLE_APPLICATION_CREDENTIALS` in `.env` to the key path.

Optional: create a Cloud Translation glossary (if you want server-side glossary usage in addition to local rule enforcement).

## 2. Install and Configure

```bash
npm install
cp .env.example .env
```

Edit `.env`:

- `GOOGLE_APPLICATION_CREDENTIALS` (required)
- `TRANSLATION_PROJECT_ID` or `GOOGLE_CLOUD_PROJECT`
- `DEFAULT_DIRECTION`
- `PORT`
- `GLOSSARY_PATH` (default `config/glossary.csv`)
- `RECORDING_DIR` (default `recordings`; per-session transcripts land here)
- `RECORD_PROGRAM` (optional: `sox`, `rec`, `arecord`; auto-detect if empty)
- Optional `TRANSLATION_GLOSSARY_ID`

Update glossary terms in `config/glossary.csv`:

```csv
english_term,chinese_term
Sacrament,圣餐
Ward,支会
Bishop,主教
```

## 3. Run Locally

```bash
npm start
```

Open:

```text
http://localhost:3000
```

## Runtime Behavior

- `Start Session` opens microphone stream and ASR pipeline.
- Final ASR segments are translated and pushed to all connected browsers.
- Interim ASR text is displayed live as a preview.
- Direction change while running restarts ASR with correct language and phrase hints.

## Data Flow (Layered)

1. Audio Input Layer: microphone/mixer audio is captured with `node-record-lpcm16`.
2. ASR Layer: Google streaming recognition emits interim/final transcripts. Local glossary entries are passed as phrase hints to bias recognition toward known proper nouns (e.g. "Sacrament", "Ward", "Bishop").
3. Translation Layer: Google Translation API (optionally with Cloud Translation glossary for term consistency).
4. Broadcast Layer: subtitles sent via WebSocket.
5. Display Layer: browser control panel + large subtitle display.

## Term Consistency Strategy

This project splits the two concerns of term handling between layers that each do their job well:

- **Local `config/glossary.csv` -> ASR phrase hints**: helps the recognizer "hear" proper nouns correctly. Without this, "Sacrament" can be transcribed as "secrement" and downstream translation has no way to recover.
- **Cloud Translation glossary -> translation output**: if you need to force specific translations (e.g. "Sacrament" -> "圣餐" rather than Google's default), create a Cloud Translation glossary resource and set `TRANSLATION_GLOSSARY_ID`. Server-side glossary is more reliable than ad-hoc string replacement on the translated text.

Earlier versions of this repo did post-translation string replacement locally. That approach was removed because it only worked when Google left source-language tokens in the output, which rarely happens for terms Google already knows.

## Cloud Translation Glossary

Local `config/glossary.csv` is used for ASR phrase hints. If you also want
**server-side translation enforcement** (e.g. force "Sacrament" → "圣餐"
even when Google's default would differ), provision a Cloud Translation
glossary using the included script:

```bash
./scripts/sync-cloud-glossary.sh
```

The script reads `.env`, transforms `config/glossary.csv` into Google's
equivalent-term-set format, manages the GCS staging bucket and IAM
binding for the service account, deletes any existing glossary with the
same id, creates a fresh one from the uploaded file, and verifies the
entry count.

Required `.env` values before running:

- `TRANSLATION_PROJECT_ID` — your GCP project id or number
- `TRANSLATION_LOCATION` — a region such as `us-central1` (NOT `global`;
  glossaries are regional resources)
- `TRANSLATION_GLOSSARY_ID` — the name you want for the glossary resource
- `GOOGLE_APPLICATION_CREDENTIALS` — path to your service account JSON

Optional:

- `GLOSSARY_BUCKET` — GCS bucket name (defaults to
  `verba-bridge-glossary-<project>`)
- `GLOSSARY_LANGUAGES` — BCP-47 codes (default `en,zh-CN`)

Re-run the script any time you edit `config/glossary.csv` to push the
updated terms to Cloud Translation. The operation is idempotent and
safe to run repeatedly.

Requirements on the host: `bash`, `gcloud` SDK (`gcloud` + `gsutil`),
`python3`, `curl`. The user running the script must either be
authenticated via `gcloud auth login` or the script will fall back to
the service account key for authentication.

## Session Transcripts

Every session writes a plain-text transcript to `RECORDING_DIR` (default `recordings/`).

- File is opened when you press **Start Session** and closed on **Stop Session** (or process shutdown).
- Filename pattern: `YYYYMMDD-HHMMSS_<DIRECTION>.txt` (local time).
- Each final subtitle is logged with timestamp, direction, source text, and translated text. Interim drafts are not recorded.
- Switching direction mid-session does not rotate the file; the new direction is reflected on subsequent entries.

Example transcript:

```text
=== VerbaBridge transcript ===
Started:   2026-05-23 22:45:12
Direction: EN→ZH

[22:45:18] EN→ZH
  Welcome, brothers and sisters.
  欢迎各位弟兄姐妹。

[22:45:23] EN→ZH
  We will now bless the Sacrament.
  我们现在为圣餐祝福。

Ended:     2026-05-23 23:30:05
```

The `recordings/` directory is gitignored by default.

## Estimated API Cost (90-minute session)

Pricing varies by region/model and can change. Use this as a planning range and verify against current Google pricing.

Planning example:

- Speech-to-Text streaming: roughly 90 minutes of audio
- Translation: depends on speaking speed; often 60,000 to 120,000 characters translated

Typical planning range for one 90-minute session:

- Low speech volume: about USD $2 to $3
- Higher speech volume: about USD $3 to $6

Use this formula for your own estimate:

```text
Estimated cost = (ASR minutes * ASR per-minute rate) + (translated characters / 1,000,000 * translation per-million rate)
```

## Error Handling Included

- ASR stream errors surfaced to UI and logs
- Automatic ASR pipeline restart on common stream-duration errors
- API/translation failures surfaced without crashing process
- Invalid control requests return structured API errors

## Extend to More Languages

1. Add new direction constants in `src/constants.js`.
2. Define source/target language codes for the new direction.
3. Add corresponding glossary columns or a separate glossary file strategy.
4. Update UI direction dropdown in `public/index.html`.
5. Restart and test end-to-end.

## Notes for Production Use

- Pin specific recording backend (`RECORD_PROGRAM`) in `.env` for stable behavior on your laptop.
- Validate the exact mixer/audio interface input device before each meeting.
- Keep glossary focused and reviewed by bilingual reviewers.
- Run on wired power and stable network.

## Troubleshooting

- `Error: spawn sox ENOENT`
  - Cause: recorder binary is not installed or not in `PATH`.
  - Fix (macOS): `brew install sox`
  - Alternative: set `.env` `RECORD_PROGRAM` to an installed recorder (`sox`, `rec`, or `arecord`).

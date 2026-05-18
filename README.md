# VerbaBridge

Real-time bilingual subtitle system for sacrament meetings.

Pipeline:

Audio Input -> Google Streaming ASR -> Terminology Correction -> Google Translation -> Terminology Enforcement -> WebSocket Broadcast -> Browser Display

This repo is intentionally minimal, layered, and maintainable.

## Features

- Live microphone capture from mixer/audio interface
- Streaming speech recognition with Google Cloud Speech-to-Text
- Direction switching:
  - `EN_TO_ZH` (English -> Chinese)
  - `ZH_TO_EN` (Chinese -> English)
- Glossary-driven terminology enforcement from `config/glossary.csv`
- Optional Cloud Translation glossary support
- Local WebSocket broadcast + browser subtitle display
- Simple control panel:
  - Start/Stop session
  - Direction switch
  - Connection status
  - Approximate latency

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
      terminologyEnforcer.js
    websocket/
      subtitleHub.js
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
2. ASR Layer: Google streaming recognition emits interim/final transcripts.
3. Terminology Correction Layer: rule-based source cleanup from local glossary.
4. Translation Layer: Google Translation API (optionally with Cloud glossary).
5. Terminology Enforcement Layer: strict post-translation replacements from local glossary.
6. Broadcast Layer: subtitles sent via WebSocket.
7. Display Layer: browser control panel + large subtitle display.

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

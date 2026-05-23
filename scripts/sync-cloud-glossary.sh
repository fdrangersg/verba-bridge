#!/usr/bin/env bash
#
# sync-cloud-glossary.sh
#
# Provisions or refreshes the Cloud Translation glossary used by
# verba-bridge. Idempotent: every run converges to the state described
# by .env + config/glossary.csv.
#
# Steps:
#   1. Validate prerequisites (gcloud, gsutil, python3, curl)
#   2. Load configuration from .env
#   3. Generate Google-format CSV (header en,zh-CN) from the source CSV
#   4. Ensure the staging GCS bucket exists (create on first run)
#   5. Grant the service account storage.objectViewer on the bucket
#   6. Upload the transformed CSV
#   7. If a glossary with the configured ID exists, delete it and wait
#   8. Create the glossary and wait for the long-running operation
#   9. Verify entryCount matches the source CSV
#
# Usage:
#   ./scripts/sync-cloud-glossary.sh
#
# Required env vars (read from .env, override via shell export):
#   TRANSLATION_PROJECT_ID     numeric or string project id
#   TRANSLATION_LOCATION       region, e.g. us-central1 (NOT global)
#   TRANSLATION_GLOSSARY_ID    desired glossary resource id
#   GOOGLE_APPLICATION_CREDENTIALS  path to service account JSON
#
# Optional env vars:
#   GLOSSARY_BUCKET     GCS bucket name (default: verba-bridge-glossary-<project>)
#   GLOSSARY_PATH       source CSV path (default: config/glossary.csv)
#   GLOSSARY_LANGUAGES  comma-separated BCP-47 codes (default: en,zh-CN)
#   POLL_TIMEOUT_SEC    max seconds to wait per LRO (default: 600)
#   POLL_INTERVAL_SEC   poll interval in seconds (default: 5)

set -euo pipefail

# ─── paths ──────────────────────────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
ENV_FILE="$ROOT_DIR/.env"
DEFAULT_SOURCE_CSV="$ROOT_DIR/config/glossary.csv"
TMP_DIR="$ROOT_DIR/tmp"
CLOUD_CSV="$TMP_DIR/cloud-glossary.csv"

# ─── tty-aware logging ──────────────────────────────────────────────────────
if [ -t 1 ] && command -v tput >/dev/null 2>&1; then
  C_RED="$(tput setaf 1)"
  C_GREEN="$(tput setaf 2)"
  C_YELLOW="$(tput setaf 3)"
  C_BLUE="$(tput setaf 4)"
  C_BOLD="$(tput bold)"
  C_RESET="$(tput sgr0)"
else
  C_RED=""; C_GREEN=""; C_YELLOW=""; C_BLUE=""; C_BOLD=""; C_RESET=""
fi

log_info()  { printf "%s[INFO]%s  %s\n"  "$C_BLUE"   "$C_RESET" "$*"; }
log_ok()    { printf "%s[OK]%s    %s\n"  "$C_GREEN"  "$C_RESET" "$*"; }
log_warn()  { printf "%s[WARN]%s  %s\n"  "$C_YELLOW" "$C_RESET" "$*" >&2; }
log_err()   { printf "%s[ERROR]%s %s\n"  "$C_RED"    "$C_RESET" "$*" >&2; }
log_step()  { printf "\n%s%s>> %s%s\n" "$C_BOLD" "$C_BLUE" "$*" "$C_RESET"; }

die() { log_err "$*"; exit 1; }

on_error() {
  local exit_code=$?
  log_err "Script aborted with exit code $exit_code at line $1."
  exit "$exit_code"
}
trap 'on_error $LINENO' ERR

# ─── 1. prerequisites ───────────────────────────────────────────────────────
log_step "Checking prerequisites"

require_cmd() {
  command -v "$1" >/dev/null 2>&1 \
    || die "Required command '$1' not found. ${2:-Install it and retry.}"
}

require_cmd bash    "Bash 4+ recommended."
require_cmd curl    "Install via your package manager."
require_cmd python3 "Install Python 3 (most macOS/Linux ship with it)."
require_cmd gcloud  "Install Google Cloud SDK: https://cloud.google.com/sdk/docs/install"
require_cmd gsutil  "Part of the Google Cloud SDK; usually installed alongside gcloud."

log_ok "All required commands present."

# ─── 2. configuration ───────────────────────────────────────────────────────
log_step "Loading configuration"

if [ -f "$ENV_FILE" ]; then
  # shellcheck disable=SC1090
  set -a; source "$ENV_FILE"; set +a
  log_info "Loaded variables from .env"
else
  log_warn ".env not found at $ENV_FILE; relying on already-exported variables."
fi

require_var() {
  local name=$1
  local value="${!name:-}"
  if [ -z "$value" ]; then
    die "Required variable '$name' is empty. Set it in .env or export it before running."
  fi
}

require_var TRANSLATION_PROJECT_ID
require_var TRANSLATION_LOCATION
require_var TRANSLATION_GLOSSARY_ID
require_var GOOGLE_APPLICATION_CREDENTIALS

if [ "$TRANSLATION_LOCATION" = "global" ]; then
  die "TRANSLATION_LOCATION is 'global', but glossaries are regional resources. Use a region like 'us-central1'."
fi

if [ ! -f "$GOOGLE_APPLICATION_CREDENTIALS" ]; then
  die "Service account key not found at $GOOGLE_APPLICATION_CREDENTIALS"
fi

PROJECT="$TRANSLATION_PROJECT_ID"
LOCATION="$TRANSLATION_LOCATION"
GLOSSARY_ID="$TRANSLATION_GLOSSARY_ID"
SOURCE_CSV="${GLOSSARY_PATH:-$DEFAULT_SOURCE_CSV}"
if [ ! "${SOURCE_CSV:0:1}" = "/" ]; then
  SOURCE_CSV="$ROOT_DIR/$SOURCE_CSV"
fi
LANGUAGES="${GLOSSARY_LANGUAGES:-en,zh-CN}"
BUCKET="${GLOSSARY_BUCKET:-verba-bridge-glossary-$PROJECT}"
POLL_TIMEOUT="${POLL_TIMEOUT_SEC:-600}"
POLL_INTERVAL="${POLL_INTERVAL_SEC:-5}"

API_BASE="https://translation.googleapis.com/v3"
PARENT="projects/$PROJECT/locations/$LOCATION"
GLOSSARY_NAME="$PARENT/glossaries/$GLOSSARY_ID"
GCS_OBJECT="gs://$BUCKET/cloud-glossary.csv"

log_info "Project:      $PROJECT"
log_info "Location:     $LOCATION"
log_info "Glossary ID:  $GLOSSARY_ID"
log_info "Languages:    $LANGUAGES"
log_info "Source CSV:   $SOURCE_CSV"
log_info "GCS bucket:   gs://$BUCKET"
log_info "GCS object:   $GCS_OBJECT"

# ─── 3. resolve service account email ───────────────────────────────────────
SA_EMAIL=$(python3 - <<PY
import json, sys
with open("$GOOGLE_APPLICATION_CREDENTIALS") as f:
    data = json.load(f)
email = data.get("client_email")
if not email:
    sys.exit("client_email missing in service account JSON")
print(email)
PY
)
log_info "Service account: $SA_EMAIL"

# ─── 4. access token ────────────────────────────────────────────────────────
log_step "Acquiring access token"

ACCESS_TOKEN=$(gcloud auth print-access-token 2>/dev/null || true)
if [ -z "$ACCESS_TOKEN" ]; then
  log_warn "User credentials not available; activating service account."
  gcloud auth activate-service-account \
    --key-file="$GOOGLE_APPLICATION_CREDENTIALS" \
    --quiet
  ACCESS_TOKEN=$(gcloud auth print-access-token)
fi
log_ok "Access token acquired."

# ─── 5. generate cloud-format CSV ───────────────────────────────────────────
log_step "Generating Google-format CSV"

[ -f "$SOURCE_CSV" ] || die "Source CSV not found: $SOURCE_CSV"
mkdir -p "$TMP_DIR"

python3 - <<PY
import csv, sys

source = "$SOURCE_CSV"
target = "$CLOUD_CSV"
languages = "$LANGUAGES".split(",")

with open(source, newline="", encoding="utf-8") as f:
    rows = list(csv.reader(f))
if not rows:
    sys.exit("Source CSV is empty.")

header = [c.strip().lower() for c in rows[0]]
data_rows = rows[1:] if ("english" in header[0] and "chinese" in header[1]) else rows

cleaned = []
for r in data_rows:
    if len(r) < 2:
        continue
    en, zh = r[0].strip(), r[1].strip()
    if not en or not zh:
        continue
    cleaned.append([en, zh])

if not cleaned:
    sys.exit("No usable rows in source CSV.")

with open(target, "w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerow(languages)
    for r in cleaned:
        writer.writerow(r)

print(f"wrote {len(cleaned)} entries to {target}")
PY

EXPECTED_ENTRIES=$(($(wc -l < "$CLOUD_CSV") - 1))
log_ok "Cloud CSV written with $EXPECTED_ENTRIES entries: $CLOUD_CSV"

# ─── 6. ensure GCS bucket ───────────────────────────────────────────────────
log_step "Ensuring GCS bucket exists"

if gsutil ls -b "gs://$BUCKET" >/dev/null 2>&1; then
  log_info "Bucket gs://$BUCKET already exists."
else
  log_info "Creating bucket gs://$BUCKET in $LOCATION ..."
  gsutil mb -p "$PROJECT" -l "$LOCATION" "gs://$BUCKET"
  log_ok "Bucket created."
fi

# ─── 7. grant SA storage.objectViewer (idempotent) ──────────────────────────
log_step "Granting service account read access to bucket"

gcloud storage buckets add-iam-policy-binding "gs://$BUCKET" \
  --member="serviceAccount:$SA_EMAIL" \
  --role="roles/storage.objectViewer" \
  --quiet >/dev/null
log_ok "IAM binding ensured (idempotent)."

# ─── 8. upload cloud CSV ────────────────────────────────────────────────────
log_step "Uploading glossary CSV to GCS"

gsutil cp "$CLOUD_CSV" "$GCS_OBJECT"
log_ok "Uploaded to $GCS_OBJECT"

# ─── 9. LRO helper ──────────────────────────────────────────────────────────
api_call() {
  local method=$1 url=$2 body=${3:-}
  local args=(-sS -X "$method" \
    -H "Authorization: Bearer $ACCESS_TOKEN" \
    -H "Content-Type: application/json")
  if [ -n "$body" ]; then
    args+=(-d "$body")
  fi
  curl "${args[@]}" "$url"
}

# Read a top-level JSON field; empty string if missing.
json_field() {
  local field=$1 json=$2
  python3 -c "import json,sys; d=json.loads(sys.argv[1]); print(d.get(sys.argv[2],'') if isinstance(d.get(sys.argv[2]), str) else json.dumps(d.get(sys.argv[2])) if d.get(sys.argv[2]) is not None else '')" "$json" "$field"
}

wait_for_operation() {
  local op_name=$1
  local deadline=$(( $(date +%s) + POLL_TIMEOUT ))
  log_info "Waiting on operation: $op_name"
  while [ "$(date +%s)" -lt "$deadline" ]; do
    local resp
    resp=$(api_call GET "$API_BASE/$op_name")
    local done
    done=$(python3 -c "import json,sys; print(str(json.loads(sys.argv[1]).get('done', False)).lower())" "$resp")
    if [ "$done" = "true" ]; then
      local error
      error=$(python3 -c "import json,sys; d=json.loads(sys.argv[1]); print(json.dumps(d.get('error',{})))" "$resp")
      if [ "$error" != "{}" ] && [ -n "$error" ]; then
        log_err "Operation failed: $error"
        return 1
      fi
      log_ok "Operation completed."
      return 0
    fi
    sleep "$POLL_INTERVAL"
  done
  log_err "Operation timed out after ${POLL_TIMEOUT}s."
  return 1
}

# ─── 10. delete existing glossary if present ────────────────────────────────
log_step "Deleting existing glossary (if present)"

GET_RESPONSE=$(api_call GET "$API_BASE/$GLOSSARY_NAME")
GLOSSARY_EXISTS=$(python3 -c "import json,sys; d=json.loads(sys.argv[1]); print('yes' if d.get('name') else 'no')" "$GET_RESPONSE")

if [ "$GLOSSARY_EXISTS" = "yes" ]; then
  log_info "Glossary exists; deleting to allow recreation."
  DELETE_RESPONSE=$(api_call DELETE "$API_BASE/$GLOSSARY_NAME")
  OP_NAME=$(python3 -c "import json,sys; print(json.loads(sys.argv[1]).get('name',''))" "$DELETE_RESPONSE")
  if [ -z "$OP_NAME" ]; then
    log_err "Delete did not return an operation: $DELETE_RESPONSE"
    exit 1
  fi
  wait_for_operation "$OP_NAME"
  log_ok "Old glossary deleted."
else
  log_info "No existing glossary at $GLOSSARY_NAME; skipping delete."
fi

# ─── 11. create glossary ────────────────────────────────────────────────────
log_step "Creating glossary"

LANGUAGE_CODES_JSON=$(python3 -c "import json,sys; print(json.dumps(sys.argv[1].split(',')))" "$LANGUAGES")

CREATE_BODY=$(python3 -c "
import json, sys
print(json.dumps({
    'name': sys.argv[1],
    'languageCodesSet': {
        'languageCodes': json.loads(sys.argv[2]),
    },
    'inputConfig': {
        'gcsSource': {
            'inputUri': sys.argv[3],
        }
    }
}))" "$GLOSSARY_NAME" "$LANGUAGE_CODES_JSON" "$GCS_OBJECT")

CREATE_RESPONSE=$(api_call POST "$API_BASE/$PARENT/glossaries" "$CREATE_BODY")
CREATE_OP=$(python3 -c "import json,sys; print(json.loads(sys.argv[1]).get('name',''))" "$CREATE_RESPONSE")

if [ -z "$CREATE_OP" ]; then
  log_err "Create did not return an operation: $CREATE_RESPONSE"
  exit 1
fi
log_info "Operation accepted: $CREATE_OP"
wait_for_operation "$CREATE_OP"

# ─── 12. verify ─────────────────────────────────────────────────────────────
log_step "Verifying glossary"

VERIFY_RESPONSE=$(api_call GET "$API_BASE/$GLOSSARY_NAME")
ACTUAL_ENTRIES=$(python3 -c "import json,sys; print(json.loads(sys.argv[1]).get('entryCount',0))" "$VERIFY_RESPONSE")

if [ "$ACTUAL_ENTRIES" -ne "$EXPECTED_ENTRIES" ]; then
  log_warn "entryCount mismatch: expected $EXPECTED_ENTRIES, got $ACTUAL_ENTRIES."
  log_warn "Inspect the glossary in the GCP console; some rows may have been rejected."
else
  log_ok "Verified $ACTUAL_ENTRIES entries match the source CSV."
fi

log_step "Done"
log_ok  "Glossary '$GLOSSARY_ID' is live at $GLOSSARY_NAME"
log_info "Restart the server (npm start) to pick up the change."

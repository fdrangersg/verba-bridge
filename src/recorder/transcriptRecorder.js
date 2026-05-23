const fs = require('fs');
const path = require('path');

function pad(value) {
  return String(value).padStart(2, '0');
}

function formatLocalDate(date) {
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
    `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
  );
}

function formatLocalTime(date) {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function fileTimestamp(date) {
  return (
    `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}-` +
    `${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`
  );
}

const DIRECTION_LABEL = {
  EN_TO_ZH: 'EN→ZH',
  ZH_TO_EN: 'ZH→EN',
};

class TranscriptRecorder {
  constructor({ outputDir }) {
    this.outputDir = outputDir;
    this.stream = null;
    this.currentPath = null;
  }

  start({ direction }) {
    if (this.stream) {
      return this.currentPath;
    }

    fs.mkdirSync(this.outputDir, { recursive: true });

    const now = new Date();
    const filename = `${fileTimestamp(now)}_${direction}.txt`;
    const fullPath = path.join(this.outputDir, filename);

    this.stream = fs.createWriteStream(fullPath, { flags: 'a' });
    this.currentPath = fullPath;

    this.stream.write('=== VerbaBridge transcript ===\n');
    this.stream.write(`Started:   ${formatLocalDate(now)}\n`);
    this.stream.write(`Direction: ${DIRECTION_LABEL[direction] || direction}\n\n`);

    return fullPath;
  }

  recordSubtitle({ direction, originalText, translatedText, timestamp }) {
    if (!this.stream) {
      return;
    }

    const when = timestamp ? new Date(timestamp) : new Date();
    const directionLabel = DIRECTION_LABEL[direction] || direction;

    this.stream.write(`[${formatLocalTime(when)}] ${directionLabel}\n`);
    this.stream.write(`  ${originalText}\n`);
    this.stream.write(`  ${translatedText}\n\n`);
  }

  stop() {
    if (!this.stream) {
      return null;
    }

    const closedPath = this.currentPath;
    this.stream.write(`Ended:     ${formatLocalDate(new Date())}\n`);
    this.stream.end();
    this.stream = null;
    this.currentPath = null;
    return closedPath;
  }

  isRecording() {
    return Boolean(this.stream);
  }
}

module.exports = TranscriptRecorder;

const path = require('path');
const { DIRECTIONS, isValidDirection } = require('./constants');

const ROOT_DIR = path.resolve(__dirname, '..');

function resolveProjectPath(input, fallbackRelativePath) {
  const value = input || fallbackRelativePath;
  if (path.isAbsolute(value)) {
    return value;
  }
  return path.join(ROOT_DIR, value);
}

const defaultDirection = process.env.DEFAULT_DIRECTION || DIRECTIONS.EN_TO_ZH;

if (!isValidDirection(defaultDirection)) {
  throw new Error(
    `Invalid DEFAULT_DIRECTION "${defaultDirection}". Use EN_TO_ZH or ZH_TO_EN.`
  );
}

const port = Number(process.env.PORT || 3000);

if (!Number.isInteger(port) || port <= 0) {
  throw new Error(`Invalid PORT value: ${process.env.PORT}`);
}

const asrSampleRate = Number(process.env.ASR_SAMPLE_RATE_HERTZ || 16000);

if (!Number.isInteger(asrSampleRate) || asrSampleRate <= 0) {
  throw new Error(
    `Invalid ASR_SAMPLE_RATE_HERTZ value: ${process.env.ASR_SAMPLE_RATE_HERTZ}`
  );
}

module.exports = {
  rootDir: ROOT_DIR,
  port,
  defaultDirection,
  googleCredentialsPath: process.env.GOOGLE_APPLICATION_CREDENTIALS || '',
  glossaryPath: resolveProjectPath(process.env.GLOSSARY_PATH, 'config/glossary.csv'),
  recordingDir: resolveProjectPath(process.env.RECORDING_DIR, 'recordings'),
  asrSampleRate,
  asrInterimResults: process.env.ASR_INTERIM_RESULTS === 'true',
  audioDevice: process.env.AUDIO_DEVICE || '',
  recordProgram: process.env.RECORD_PROGRAM || '',
  translationProjectId:
    process.env.TRANSLATION_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT || '',
  translationLocation: process.env.TRANSLATION_LOCATION || 'global',
  translationGlossaryId: process.env.TRANSLATION_GLOSSARY_ID || '',
  staticDir: resolveProjectPath('public'),
};

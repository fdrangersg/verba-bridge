const EventEmitter = require('events');
const fs = require('fs');
const path = require('path');
const recorder = require('node-record-lpcm16');
const speech = require('@google-cloud/speech');

const SUPPORTED_RECORDERS = ['sox', 'rec', 'arecord'];

function hasExecutable(command) {
  if (!command) {
    return false;
  }

  if (command.includes(path.sep)) {
    try {
      fs.accessSync(command, fs.constants.X_OK);
      return true;
    } catch (error) {
      return false;
    }
  }

  const pathValue = process.env.PATH || '';
  const paths = pathValue.split(path.delimiter).filter(Boolean);

  for (const dir of paths) {
    const candidate = path.join(dir, command);
    try {
      fs.accessSync(candidate, fs.constants.X_OK);
      return true;
    } catch (error) {
      // Continue searching.
    }
  }

  return false;
}

function toError(error, fallbackMessage) {
  if (error instanceof Error) {
    return error;
  }
  if (error === undefined || error === null) {
    return new Error(fallbackMessage);
  }
  return new Error(String(error));
}

function resolveRecorder(preferredRecorder) {
  if (preferredRecorder) {
    if (!SUPPORTED_RECORDERS.includes(preferredRecorder)) {
      throw new Error(
        `Invalid RECORD_PROGRAM "${preferredRecorder}". Use one of: ${SUPPORTED_RECORDERS.join(
          ', '
        )}.`
      );
    }

    if (!hasExecutable(preferredRecorder)) {
      throw new Error(
        `Audio recorder "${preferredRecorder}" is not available in PATH. Install it or choose a different RECORD_PROGRAM.`
      );
    }

    return preferredRecorder;
  }

  const defaultRecorderOrder =
    process.platform === 'linux' ? ['arecord', 'rec', 'sox'] : ['sox', 'rec', 'arecord'];

  for (const candidate of defaultRecorderOrder) {
    if (hasExecutable(candidate)) {
      return candidate;
    }
  }

  throw new Error(
    'No supported recorder binary found in PATH. Install SoX (macOS: brew install sox) or set RECORD_PROGRAM to an installed recorder (sox, rec, arecord).'
  );
}

class GoogleStreamingAsr extends EventEmitter {
  constructor({
    languageCode,
    phraseHints,
    sampleRateHertz,
    interimResults,
    audioDevice,
    recordProgram,
  }) {
    super();
    this.languageCode = languageCode;
    this.phraseHints = phraseHints || [];
    this.sampleRateHertz = sampleRateHertz || 16000;
    this.interimResults = interimResults || false;
    this.audioDevice = audioDevice || '';
    this.recordProgram = recordProgram || undefined;

    this.client = new speech.SpeechClient();
    this.recording = null;
    this.recognizeStream = null;
    this.activeRecorder = null;
    this.running = false;
  }

  start() {
    if (this.running) {
      return;
    }

    const selectedRecorder = resolveRecorder(this.recordProgram);

    const request = {
      config: {
        encoding: 'LINEAR16',
        sampleRateHertz: this.sampleRateHertz,
        languageCode: this.languageCode,
        enableAutomaticPunctuation: true,
      },
      interimResults: this.interimResults,
    };

    if (this.phraseHints.length > 0) {
      request.config.speechContexts = [
        {
          phrases: this.phraseHints,
          boost: 20,
        },
      ];
    }

    let recognizeStream = null;
    let recording = null;

    try {
      recognizeStream = this.client
        .streamingRecognize(request)
        .on('error', (error) => {
          this.emit('error', toError(error, 'ASR streaming error.'));
        })
        .on('data', (data) => {
          this.handleStreamData(data);
        });

      const recorderOptions = {
        sampleRate: this.sampleRateHertz,
        channels: 1,
        threshold: 0,
        silence: '1.0',
        recorder: selectedRecorder,
      };

      if (this.audioDevice) {
        recorderOptions.device = this.audioDevice;
      }

      recording = recorder.record(recorderOptions);

      if (recording.process) {
        recording.process.on('error', (error) => {
          this.emit('error', this.normalizeRecorderError(selectedRecorder, error));
        });
      }

      recording
        .stream()
        .on('error', (error) => {
          this.emit('error', this.normalizeRecorderError(selectedRecorder, error));
        })
        .pipe(recognizeStream);
    } catch (error) {
      if (recording) {
        try {
          recording.stop();
        } catch (stopError) {
          // Ignore cleanup failures.
        }
      }

      if (recognizeStream) {
        try {
          recognizeStream.end();
        } catch (endError) {
          // Ignore cleanup failures.
        }
      }

      throw this.normalizeRecorderError(selectedRecorder, error);
    }

    this.recording = recording;
    this.recognizeStream = recognizeStream;
    this.activeRecorder = selectedRecorder;
    this.running = true;

    this.emit('status', {
      state: 'started',
      languageCode: this.languageCode,
      recorder: selectedRecorder,
    });
  }

  stop() {
    if (!this.running && !this.recording && !this.recognizeStream) {
      return;
    }

    this.running = false;

    if (this.recording) {
      try {
        this.recording.stop();
      } catch (error) {
        // Recorder can already be stopped; no-op.
      }
      this.recording = null;
    }

    if (this.recognizeStream) {
      this.recognizeStream.end();
      this.recognizeStream = null;
    }

    this.emit('status', {
      state: 'stopped',
      languageCode: this.languageCode,
      recorder: this.activeRecorder,
    });

    this.activeRecorder = null;
  }

  normalizeRecorderError(recorderName, error) {
    const normalized = toError(error, 'Recorder startup failed.');
    const message = normalized.message || '';
    const code = normalized.code || '';
    const isMissingBinary =
      code === 'ENOENT' || /ENOENT/i.test(message) || /spawn\\s+\\S+\\s+ENOENT/i.test(message);

    if (!isMissingBinary) {
      return normalized;
    }

    const wrapped = new Error(
      `Audio recorder \"${recorderName}\" is not installed or not in PATH. Install SoX (macOS: brew install sox) or set RECORD_PROGRAM to an installed recorder (sox, rec, arecord).`
    );
    wrapped.code = 'ENOENT';
    return wrapped;
  }

  handleStreamData(data) {
    const result = data.results && data.results[0];
    const alternative = result && result.alternatives && result.alternatives[0];

    if (!alternative || !alternative.transcript) {
      return;
    }

    const text = alternative.transcript.trim();

    if (!text) {
      return;
    }

    this.emit('transcript', {
      text,
      isFinal: Boolean(result.isFinal),
      stability: typeof result.stability === 'number' ? result.stability : null,
      asrTimestamp: Date.now(),
    });
  }
}

module.exports = GoogleStreamingAsr;

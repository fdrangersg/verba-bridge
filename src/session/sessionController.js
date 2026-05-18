const EventEmitter = require('events');
const GoogleStreamingAsr = require('../asr/googleStreamingAsr');
const { DIRECTION_CONFIG, DIRECTIONS, isValidDirection } = require('../constants');

class SessionController extends EventEmitter {
  constructor({
    terminologyEnforcer,
    translator,
    defaultDirection,
    asrSampleRate,
    asrInterimResults,
    audioDevice,
    recordProgram,
  }) {
    super();
    this.terminologyEnforcer = terminologyEnforcer;
    this.translator = translator;

    this.direction = defaultDirection || DIRECTIONS.EN_TO_ZH;
    this.asrSampleRate = asrSampleRate;
    this.asrInterimResults = asrInterimResults;
    this.audioDevice = audioDevice;
    this.recordProgram = recordProgram;

    this.running = false;
    this.asr = null;
    this.restarting = false;

    this.latencySamples = [];
    this.lastLatencyMs = null;
  }

  async start() {
    if (this.running) {
      return this.getStatus();
    }

    await this.startAsrPipeline();
    this.running = true;
    this.emitStatus();
    return this.getStatus();
  }

  async stop() {
    if (!this.running && !this.asr) {
      return this.getStatus();
    }

    this.running = false;
    this.stopAsrPipeline();
    this.emitStatus();
    return this.getStatus();
  }

  async setDirection(direction) {
    if (!isValidDirection(direction)) {
      throw new Error('Invalid direction. Use EN_TO_ZH or ZH_TO_EN.');
    }

    const changed = this.direction !== direction;
    this.direction = direction;

    if (this.running && changed) {
      await this.restartPipeline();
    }

    this.emitStatus();
    return this.getStatus();
  }

  async restartPipeline() {
    this.restarting = true;
    this.stopAsrPipeline();
    await this.startAsrPipeline();
    this.restarting = false;
    this.emitStatus();
  }

  stopAsrPipeline() {
    if (this.asr) {
      this.asr.removeAllListeners();
      this.asr.stop();
      this.asr = null;
    }
  }

  async startAsrPipeline() {
    const directionConfig = DIRECTION_CONFIG[this.direction];
    const phraseHints = this.terminologyEnforcer.getPhraseHints(this.direction);

    this.asr = new GoogleStreamingAsr({
      languageCode: directionConfig.inputLanguageCode,
      phraseHints,
      sampleRateHertz: this.asrSampleRate,
      interimResults: this.asrInterimResults,
      audioDevice: this.audioDevice,
      recordProgram: this.recordProgram,
    });

    this.asr.on('transcript', (event) => {
      this.handleTranscriptEvent(event).catch((error) => {
        this.emitError('Failed to process transcript.', error);
      });
    });

    this.asr.on('error', (error) => {
      this.handleAsrError(error);
    });

    try {
      this.asr.start();
    } catch (error) {
      this.asr.removeAllListeners();
      this.asr = null;
      throw error;
    }
  }

  async handleTranscriptEvent(event) {
    const { text, isFinal, stability, asrTimestamp } = event;

    if (!isFinal) {
      this.emit('interim', {
        text,
        stability,
        direction: this.direction,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const directionAtCapture = this.direction;
    const directionConfig = DIRECTION_CONFIG[directionAtCapture];
    const correctedSource = this.terminologyEnforcer.correctSourceText(
      text,
      directionAtCapture
    );

    const translationResult = await this.translator.translate(correctedSource, {
      sourceLanguageCode: directionConfig.sourceLanguageCode,
      targetLanguageCode: directionConfig.targetLanguageCode,
    });

    const enforcedTarget = this.terminologyEnforcer.enforceTargetText(
      correctedSource,
      translationResult.translatedText,
      directionAtCapture
    );

    const latencyMs = Math.max(0, Date.now() - asrTimestamp);
    this.recordLatency(latencyMs);

    this.emit('subtitle', {
      timestamp: new Date().toISOString(),
      direction: directionAtCapture,
      originalText: correctedSource,
      translatedText: enforcedTarget,
      latencyMs,
      usedCloudGlossary: translationResult.usedGlossary,
    });

    this.emitStatus();
  }

  handleAsrError(error) {
    this.emitError('ASR stream error.', error);

    if (!this.running || this.restarting) {
      return;
    }

    const message = (error && error.message) || '';
    const rawCode = error && error.code;
    const numericCode = Number(rawCode);
    const isMissingRecorder =
      rawCode === 'ENOENT' ||
      /not installed or not in PATH/i.test(message) ||
      /no supported recorder binary/i.test(message) ||
      /spawn\\s+\\S+\\s+ENOENT/i.test(message);

    if (isMissingRecorder) {
      this.running = false;
      this.stopAsrPipeline();
      this.emitStatus();
      return;
    }

    const shouldRestart =
      numericCode === 11 ||
      numericCode === 409 ||
      /maximum allowed stream duration/i.test(message);

    if (shouldRestart) {
      this.restartPipeline().catch((restartError) => {
        this.emitError('ASR pipeline restart failed.', restartError);
      });
    }
  }

  emitError(prefix, error) {
    this.emit('error', {
      timestamp: new Date().toISOString(),
      message: `${prefix} ${error.message || error}`,
    });
  }

  recordLatency(latencyMs) {
    this.lastLatencyMs = latencyMs;
    this.latencySamples.push(latencyMs);

    if (this.latencySamples.length > 30) {
      this.latencySamples.shift();
    }
  }

  getAverageLatencyMs() {
    if (this.latencySamples.length === 0) {
      return null;
    }

    const total = this.latencySamples.reduce((sum, value) => sum + value, 0);
    return Math.round(total / this.latencySamples.length);
  }

  emitStatus() {
    this.emit('status', this.getStatus());
  }

  getStatus() {
    return {
      running: this.running,
      direction: this.direction,
      inputLanguageCode: DIRECTION_CONFIG[this.direction].inputLanguageCode,
      lastLatencyMs: this.lastLatencyMs,
      averageLatencyMs: this.getAverageLatencyMs(),
      activeHints: this.terminologyEnforcer.getPhraseHints(this.direction).length,
    };
  }
}

module.exports = SessionController;

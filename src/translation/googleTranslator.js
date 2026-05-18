const { v3 } = require('@google-cloud/translate');

class GoogleTranslator {
  constructor({ projectId, location, glossaryId }) {
    this.client = new v3.TranslationServiceClient();
    this.projectId = projectId || '';
    this.location = location || 'global';
    this.glossaryId = glossaryId || '';
    this.detectedProjectId = null;
  }

  async resolveProjectId() {
    if (this.projectId) {
      return this.projectId;
    }

    if (this.detectedProjectId) {
      return this.detectedProjectId;
    }

    try {
      this.detectedProjectId = await this.client.getProjectId();
      return this.detectedProjectId;
    } catch (error) {
      return '';
    }
  }

  async translate(text, { sourceLanguageCode, targetLanguageCode }) {
    if (!text || !text.trim()) {
      return {
        translatedText: '',
        usedGlossary: false,
      };
    }

    const projectId = await this.resolveProjectId();

    if (!projectId) {
      throw new Error(
        'Translation project id is not configured. Set TRANSLATION_PROJECT_ID or GOOGLE_CLOUD_PROJECT.'
      );
    }

    const parent = `projects/${projectId}/locations/${this.location}`;
    const request = {
      parent,
      contents: [text],
      mimeType: 'text/plain',
      sourceLanguageCode,
      targetLanguageCode,
    };

    if (this.glossaryId) {
      request.glossaryConfig = {
        glossary: `${parent}/glossaries/${this.glossaryId}`,
      };
    }

    const [response] = await this.client.translateText(request);
    let translatedText = response.translations?.[0]?.translatedText || '';
    let usedGlossary = false;

    if (response.glossaryTranslations?.[0]?.translatedText) {
      translatedText = response.glossaryTranslations[0].translatedText;
      usedGlossary = true;
    }

    return {
      translatedText,
      usedGlossary,
    };
  }
}

module.exports = GoogleTranslator;

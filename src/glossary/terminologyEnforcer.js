const { DIRECTIONS } = require('../constants');

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function replaceWholeWord(text, search, replacement) {
  const pattern = new RegExp(`\\b${escapeRegExp(search)}\\b`, 'gi');
  return text.replace(pattern, replacement);
}

function replaceLiteral(text, search, replacement) {
  if (!search) {
    return text;
  }
  return text.split(search).join(replacement);
}

function hasWholeWord(text, search) {
  const pattern = new RegExp(`\\b${escapeRegExp(search)}\\b`, 'i');
  return pattern.test(text);
}

class TerminologyEnforcer {
  constructor(entries) {
    this.entries = [...entries].sort((a, b) => b.english.length - a.english.length);
  }

  getPhraseHints(direction) {
    if (direction === DIRECTIONS.EN_TO_ZH) {
      return this.entries.map((entry) => entry.english);
    }
    return this.entries.map((entry) => entry.chinese);
  }

  correctSourceText(text, direction) {
    let corrected = text;

    if (direction === DIRECTIONS.EN_TO_ZH) {
      this.entries.forEach(({ english, chinese }) => {
        corrected = replaceLiteral(corrected, chinese, english);
      });
      return corrected;
    }

    this.entries.forEach(({ english, chinese }) => {
      corrected = replaceWholeWord(corrected, english, chinese);
    });

    return corrected;
  }

  enforceTargetText(sourceText, translatedText, direction) {
    let enforced = translatedText;

    if (direction === DIRECTIONS.EN_TO_ZH) {
      this.entries.forEach(({ english, chinese }) => {
        if (hasWholeWord(sourceText, english)) {
          enforced = replaceWholeWord(enforced, english, chinese);
        }
        enforced = replaceLiteral(enforced, english, chinese);
      });

      return enforced;
    }

    this.entries.forEach(({ english, chinese }) => {
      if (sourceText.includes(chinese)) {
        enforced = replaceLiteral(enforced, chinese, english);
      }
      enforced = replaceLiteral(enforced, chinese, english);
    });

    return enforced;
  }
}

module.exports = TerminologyEnforcer;

const { DIRECTIONS } = require('../constants');

class GlossaryHints {
  constructor(entries) {
    this.entries = entries;
  }

  getPhraseHints(direction) {
    if (direction === DIRECTIONS.EN_TO_ZH) {
      return this.entries.map((entry) => entry.english);
    }
    return this.entries.map((entry) => entry.chinese);
  }
}

module.exports = GlossaryHints;

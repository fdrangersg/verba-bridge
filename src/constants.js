const DIRECTIONS = Object.freeze({
  EN_TO_ZH: 'EN_TO_ZH',
  ZH_TO_EN: 'ZH_TO_EN',
});

const DIRECTION_CONFIG = Object.freeze({
  [DIRECTIONS.EN_TO_ZH]: {
    inputLanguageCode: 'en-US',
    sourceLanguageCode: 'en',
    targetLanguageCode: 'zh-CN',
    hintColumn: 'english',
  },
  [DIRECTIONS.ZH_TO_EN]: {
    inputLanguageCode: 'zh-CN',
    sourceLanguageCode: 'zh-CN',
    targetLanguageCode: 'en',
    hintColumn: 'chinese',
  },
});

function isValidDirection(direction) {
  return Object.prototype.hasOwnProperty.call(DIRECTION_CONFIG, direction);
}

module.exports = {
  DIRECTIONS,
  DIRECTION_CONFIG,
  isValidDirection,
};

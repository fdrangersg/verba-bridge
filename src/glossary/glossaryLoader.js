const fs = require('fs');

function splitCsvLine(line) {
  const columns = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];

    if (char === '"') {
      const next = line[i + 1];
      if (inQuotes && next === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === ',' && !inQuotes) {
      columns.push(current.trim());
      current = '';
      continue;
    }

    current += char;
  }

  columns.push(current.trim());
  return columns;
}

function isHeaderRow(english, chinese) {
  const normalizedEnglish = english.toLowerCase();
  const normalizedChinese = chinese.toLowerCase();

  return (
    normalizedEnglish.includes('english') && normalizedChinese.includes('chinese')
  );
}

function loadGlossaryFromCsv(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const lines = raw.split(/\r?\n/);
  const entries = [];
  const dedupe = new Set();

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith('#')) {
      return;
    }

    const [english = '', chinese = ''] = splitCsvLine(trimmed);

    if (!english || !chinese) {
      throw new Error(
        `Invalid glossary row at line ${index + 1}. Expected: english_term,chinese_term`
      );
    }

    if (index === 0 && isHeaderRow(english, chinese)) {
      return;
    }

    const entry = {
      english: english.trim(),
      chinese: chinese.trim(),
    };

    const key = `${entry.english.toLowerCase()}::${entry.chinese}`;

    if (!dedupe.has(key)) {
      dedupe.add(key);
      entries.push(entry);
    }
  });

  return entries;
}

module.exports = {
  loadGlossaryFromCsv,
};

import fs from 'fs';

const csvUrl = new URL('../src/data/dictionary.csv', import.meta.url);
const dictUrl = new URL('../src/data/dictionary.json', import.meta.url);

if (!fs.existsSync(csvUrl)) {
  console.error('dictionary.csv not found');
  process.exit(1);
}

const csvText = fs.readFileSync(csvUrl, 'utf8');
const lines = csvText.split(/\r?\n/);
const grouped = {};
let count = 0;

for (let i = 1; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line) continue;

  let commaIdx = line.indexOf(',');
  if (commaIdx === -1) continue;
  const category = line.slice(0, commaIdx).trim();
  const rest = line.slice(commaIdx + 1);

  let word = '';
  let rankStr = '';

  if (rest.startsWith('"')) {
    let endQuote = -1;
    for (let j = 1; j < rest.length; j++) {
      if (rest[j] === '"') {
        if (rest[j + 1] === '"') {
          j += 1; // escaped quote
        } else {
          endQuote = j;
          break;
        }
      }
    }
    if (endQuote !== -1) {
      word = rest.slice(1, endQuote).replace(/""/g, '"');
      const afterQuote = rest.slice(endQuote + 1).trim();
      if (afterQuote.startsWith(',')) {
        rankStr = afterQuote.slice(1).trim();
      }
    }
  } else {
    const lastCommaIdx = rest.lastIndexOf(',');
    if (lastCommaIdx !== -1) {
      word = rest.slice(0, lastCommaIdx).trim();
      rankStr = rest.slice(lastCommaIdx + 1).trim();
    }
  }

  const rank = Number(rankStr);
  if (!category || !word || !Number.isFinite(rank)) continue;

  if (!grouped[category]) {
    grouped[category] = [];
  }
  grouped[category].push([word, rank]);
  count++;
}

fs.writeFileSync(dictUrl, JSON.stringify(grouped), 'utf8');
console.log(`Dictionary successfully built from CSV. Categories: ${Object.keys(grouped).length}, Entries: ${count}`);

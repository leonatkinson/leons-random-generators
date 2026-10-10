import fs from 'fs';

const dictUrl = new URL('../src/data/dictionary.json', import.meta.url);
const csvUrl = new URL('../src/data/dictionary.csv', import.meta.url);

const json = JSON.parse(fs.readFileSync(dictUrl, 'utf8'));

let csv = 'category,word,rank\n';
for (const [category, entries] of Object.entries(json)) {
  for (const [word, rank] of entries) {
    const escapedWord = word.includes(',') || word.includes('"') || word.includes('\n')
      ? `"${word.replace(/"/g, '""')}"`
      : word;
    csv += `${category},${escapedWord},${rank}\n`;
  }
}

fs.writeFileSync(csvUrl, csv, 'utf8');
console.log('Dictionary successfully converted to CSV.');

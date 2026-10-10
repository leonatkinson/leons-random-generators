import { GeneratorEngine } from '../engine/GeneratorEngine.js';
import { Dictionary } from '../engine/Dictionary.js';

const CLASSES = ['_NOUN', '_NOUNPL', '_ADJECTIVE', '_ADVERB', '_TITLE'];

function replaceInsensitive(haystack, needle, replacement) {
  if (!needle) {
    return haystack;
  }
  const lower = haystack.toLowerCase();
  const target = needle.toLowerCase();
  let result = '';
  let cursor = 0;
  let found = lower.indexOf(target, cursor);
  while (found !== -1) {
    result += haystack.slice(cursor, found) + replacement;
    cursor = found + needle.length;
    found = lower.indexOf(target, cursor);
  }
  return result + haystack.slice(cursor);
}

export class Translator {
  constructor(rawDictionary, rng) {
    this.engine = new GeneratorEngine(new Dictionary({}), rng);
    this.wordToType = new Map();
    this.typeToWord = {};
    for (const cls of CLASSES) {
      this.typeToWord[cls] = [];
      for (const entry of rawDictionary[cls] || []) {
        const word = Array.isArray(entry) ? entry[0] : entry;
        const rank = Array.isArray(entry) ? entry[1] : 2;
        if (rank <= 1) {
          continue;
        }
        const key = String(word).toLowerCase();
        if (!this.wordToType.has(key)) {
          this.wordToType.set(key, cls);
        }
        this.typeToWord[cls].push(word);
      }
    }
  }

  translate(text) {
    const source = String(text ?? '');
    let translated = source;
    const replaced = new Set();
    const tokenized = `${source}\n`.replaceAll('\r', ' ').replaceAll('\n', ' ');
    for (const rawToken of tokenized.split(' ')) {
      if (rawToken === '') {
        continue;
      }
      const token = rawToken
        .toLowerCase()
        .replaceAll('.', '')
        .replaceAll(',', '')
        .replaceAll('!', '')
        .replaceAll('?', '');
      if (!token || !this.wordToType.has(token) || replaced.has(token)) {
        continue;
      }
      const type = this.wordToType.get(token);
      const list = this.typeToWord[type];
      if (!list.length) {
        continue;
      }
      const replacement = list[this.engine.pickIndex(list.length)];
      translated = replaceInsensitive(translated, ` ${token} `, ` ${replacement} `);
      translated = replaceInsensitive(translated, ` ${token}.`, ` ${replacement}.`);
      translated = replaceInsensitive(translated, ` ${token}?`, ` ${replacement}?`);
      translated = replaceInsensitive(translated, ` ${token},`, ` ${replacement},`);
      translated = replaceInsensitive(translated, ` ${token}!`, ` ${replacement}!`);
      replaced.add(token);
    }
    return translated.charAt(0).toUpperCase() + translated.slice(1);
  }
}

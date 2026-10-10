export function weightDictionary(raw, rng) {
  const weightByRank = Math.floor(rng() * 5) !== 0;
  const out = {};
  for (const [cls, entries] of Object.entries(raw)) {
    const list = [];
    for (const entry of entries) {
      const word = Array.isArray(entry) ? entry[0] : entry.word ?? entry;
      const rank = Array.isArray(entry) ? entry[1] : entry.rank ?? 1;
      const limit = weightByRank ? rank : 1;
      for (let i = 0; i < Math.max(0, limit); i += 1) {
        list.push(word);
      }
    }
    out[cls] = list;
  }
  return out;
}

export class Dictionary {
  constructor(weighted) {
    this.shared = weighted;
    this.local = Object.create(null);
  }

  get(token) {
    if (Object.prototype.hasOwnProperty.call(this.local, token)) {
      return this.local[token];
    }
    return this.shared[token];
  }

  append(token, values) {
    if (!Object.prototype.hasOwnProperty.call(this.local, token)) {
      this.local[token] = (this.shared[token] || []).slice();
    }
    this.local[token].push(...values);
  }

  set(token, values) {
    this.local[token] = values.slice();
  }
}

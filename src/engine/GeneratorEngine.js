import { randInt } from './rng.js';

const MAX_PASSES = 40;

export class GeneratorEngine {
  constructor(dictionary, rng = Math.random) {
    this.dictionary = dictionary;
    this.rng = rng;
  }

  randInt(min, max) {
    return randInt(this.rng, min, max);
  }

  pickIndex(length) {
    if (!length) {
      const error = new Error('empty list');
      error.code = 'EMPTY_LIST';
      throw error;
    }
    return Math.floor(this.rng() * length);
  }

  pick(token) {
    const list = this.dictionary.get(token);
    if (!list || list.length === 0) {
      const error = new Error(`Missing token: ${token}`);
      error.code = 'MISSING_TOKEN';
      error.token = token;
      throw error;
    }
    return list[this.pickIndex(list.length)];
  }

  cleanup(sentence) {
    return sentence
      .replaceAll(' .', '.')
      .replaceAll(' ?', '?')
      .replaceAll(' !', '!')
      .replaceAll(' , ', ', ')
      .replaceAll(' - ', '-')
      .replaceAll(" '", "'")
      .replaceAll(' :', ':');
  }

  applyGrammar(token, chosen, state) {
    if (state.adverbOnVerb && token.startsWith('_VERB') && this.pickIndex(6) === 1) {
      const adverb = this.pick('_ADVERB');
      if (token.includes('_VERBI')) {
        return `${chosen}${adverb} `;
      }
      if (token.includes('_VERBO')) {
        return `${adverb} ${chosen}`;
      }
    } else if (state.adjectiveNounLike && token === '_ADJECTIVE' && this.randInt(0, 10) === 0) {
      return '_NOUN - LIKE ';
    } else if (state.prep && chosen.includes('_PREP')) {
      const prep = state.prep;
      if (this.randInt(0, prep.prob) < prep.keepBelow) {
        prep.prob += prep.bump;
      } else {
        prep.prob -= 1;
        if (prep.prob < 1) {
          prep.prob = 1;
        }
        return '_NOUN ';
      }
    }
    return chosen;
  }

  expand(form, options = {}) {
    const maxPasses = options.maxPasses ?? MAX_PASSES;
    let current = form;
    for (let pass = 0; pass < maxPasses; pass += 1) {
      if (!current.includes('_')) {
        break;
      }
      let sentence = options.prefix && pass === 0 ? options.prefix : '';
      let replaced = false;
      for (const token of current.split(' ')) {
        if (token === '') {
          continue;
        }
        if (token.startsWith('_')) {
          replaced = true;
          let chosen = `${this.pick(token)} `;
          if (options.hooks) {
            const next = options.hooks(token, chosen, this);
            if (next != null) {
              chosen = next;
            }
          }
          sentence += chosen;
        } else {
          sentence += `${token} `;
        }
      }
      current = sentence;
      if (!replaced) {
        break;
      }
    }
    return current;
  }

  upper(text) {
    return text.toUpperCase();
  }

  titleCase(text) {
    return text
      .toLowerCase()
      .replace(/(^|\s)\S/g, (match) => match.toUpperCase());
  }

  sentenceCase(text) {
    const lower = text.toLowerCase();
    return lower.charAt(0).toUpperCase() + lower.slice(1);
  }
}

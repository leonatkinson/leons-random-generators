import { GeneratorEngine } from '../engine/GeneratorEngine.js';

const QUOTE_FORMS = [
  "NEVER _VERBOPL _NOUNPL , UNLESS YOU CAN'T _VERBIPL",
  "IT'S BETTER TO _VERBIPL THAN _VERBIPL",
  '_NOUNPL ARE FOR THE _NOUNPL',
  '_VERBOPL _ARTICLE _NOUN',
  '_VERBOPL _NOUNPL',
  '_VERBOPL _ARTICLE _NOUN _ADVERB',
  '_VERBOPL _NOUNPL _ADVERB',
  'NEVER _VERBOPL _ARTICLE _NOUN',
  'NEVER _VERBOPL _NOUNPL',
  'NEVER _VERBOPL _ARTICLE _NOUN _ADVERB',
  'NEVER _VERBOPL _NOUNPL _ADVERB',
  'IF YOU HAVE _NOUNPL , _VERBOPL _ARTICLE _NOUN',
  'IF YOU HAVE _NOUNPL , _VERBOPL _NOUNPL',
  'IF YOU HAVE _NOUNPL , _VERBOPL _ARTICLE _NOUN _ADVERB',
  'IF YOU HAVE _NOUNPL , _VERBOPL _NOUNPL _ADVERB',
  'IF YOU ARE A _NOUN , _VERBOPL _ARTICLE _NOUN',
  'IF YOU ARE A _NOUN , _VERBOPL _NOUNPL',
  'IF YOU ARE A _NOUN , _VERBOPL _ARTICLE _NOUN _ADVERB',
  'IF YOU ARE A _NOUN , _VERBOPL _NOUNPL _ADVERB',
  '_VERBOPL _ARTICLE _NOUN _TIMES A DAY',
  '_VERBOPL _NOUNPL _TIMES A DAY',
  '_VERBOPL _ARTICLE _NOUN _ADVERB _TIMES A DAY',
  '_VERBOPL _NOUNPL _ADVERB _TIMES A DAY',
];

const AUTHOR_FORMS = [
  '_TITLE _NOUN ',
  '_TITLE _ADJECTIVE _NOUN ',
  '_ADJECTIVE _TITLE _NOUN ',
  '_TITLE _ADJECTIVE ',
  'ANONYMOUS',
  '_NAME',
];

const STARTS = [
  'always says: ',
  'has some advice:',
  'has this advice: ',
  'warns you: ',
  'will not listen to fools who say: ',
  'never believed this: ',
  'has disproven the rule: ',
];

export class Advice {
  constructor(dictionary, rng) {
    this.engine = new GeneratorEngine(dictionary, rng);
  }

  expandOnce(form) {
    let sentence = '';
    for (const token of form.split(' ')) {
      if (token === '') {
        continue;
      }
      if (token.startsWith('_')) {
        sentence += `${this.engine.pick(token)} `;
      } else {
        sentence += `${token} `;
      }
    }
    return this.engine.upper(this.engine.cleanup(sentence)).trim();
  }

  getQuote() {
    return this.expandOnce(QUOTE_FORMS[this.engine.pickIndex(QUOTE_FORMS.length)]);
  }

  getAuthor() {
    return this.expandOnce(AUTHOR_FORMS[this.engine.pickIndex(AUTHOR_FORMS.length)]);
  }

  getDate() {
    return `${this.engine.pickIndex(2000)} CE`;
  }

  getStart() {
    return STARTS[this.engine.randInt(0, STARTS.length - 1)];
  }

  getStatus() {
    return `${this.getStart()} ${this.getQuote().toLowerCase()}`;
  }

  generate() {
    return {
      quote: this.getQuote(),
      author: this.getAuthor(),
      date: this.getDate(),
    };
  }
}

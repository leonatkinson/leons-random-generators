import forms from '../data/forms.js';
import { GeneratorEngine } from '../engine/GeneratorEngine.js';

export class BandNames {
  constructor(dictionary, rng) {
    this.engine = new GeneratorEngine(dictionary, rng);
    this.install();
    this.lineForm = forms.band;
  }

  install() {
    const dict = this.engine.dictionary;
    dict.set('_PUNCT', ['?', '!', '.', '.', '.', '...']);
    dict.append('_ARTICLE', ["_NOUN 'S", "THE _NOUN 'S", "A _NOUN 'S"]);
    dict.set('_COMPOUNDNOUN', ['_NOUN', '_NOUN', '_NOUN', '_NOUN', '_NOUN - _NOUN']);
    dict.set('_SUBJECT', [
      '_COMPOUNDNOUN',
      '_ADJECTIVE _COMPOUNDNOUN',
      '_ARTICLE _COMPOUNDNOUN',
      '_ARTICLE _ADJECTIVE _COMPOUNDNOUN',
      '_SUBJECT _PREP _OBJECT',
      '_PERSON',
      '_NAME',
    ]);
    dict.set('_PERSON', [
      '_TITLE _COMPOUNDNOUN',
      '_TITLE _ADJECTIVE _COMPOUNDNOUN',
      '_ADJECTIVE _TITLE _COMPOUNDNOUN',
      '_TITLE _ADJECTIVE',
      '_CELEBRITY',
    ]);
    dict.set('_COMPOUNDNOUNPL', ['_NOUNPL', '_NOUNPL', '_NOUNPL', '_NOUNPL', '_NOUN - _NOUNPL']);
    dict.set('_SUBJECTPL', [
      '_COMPOUNDNOUNPL',
      '_ADJECTIVE _COMPOUNDNOUNPL',
      '_ARTICLE _COMPOUNDNOUNPL',
      '_ARTICLE _ADJECTIVE _COMPOUNDNOUNPL',
      '_NUMBER _COMPOUNDNOUNPL',
      '_ARTICLE _NUMBER _COMPOUNDNOUNPL',
      '_CONJUNSUB',
      '_SUBJECTPL _PREP _OBJECT',
    ]);
    dict.set('_CONJUNSUB', [
      '_SUBJECT AND _SUBJECT',
      '_SUBJECTPL AND _SUBJECT',
      '_SUBJECT AND _SUBJECTPL',
      '_SUBJECTPL AND _SUBJECTPL',
    ]);
    dict.set('_OBJECT', [
      '_NOUN',
      '_ADJECTIVE _NOUN',
      '_ARTICLE _NOUN',
      '_ARTICLE _ADJECTIVE _NOUN',
      '_TITLE _NOUN',
      '_TITLE _ADJECTIVE _NOUN',
      '_ADJECTIVE _TITLE _NOUN',
      '_TITLE _ADJECTIVE',
      'ME',
      'YOURSELF',
      '_NOUNPL',
      '_ADJECTIVE _NOUNPL',
      '_ARTICLE _NOUNPL',
      '_ARTICLE _ADJECTIVE _NOUNPL',
      '_NUMBER _NOUNPL',
      '_ARTICLE _NUMBER _NOUNPL',
      '_SUBJECT AND _SUBJECT',
      '_SUBJECTPL AND _SUBJECT',
      '_SUBJECT AND _SUBJECTPL',
      '_SUBJECTPL AND _SUBJECTPL',
      'THEM',
      'US',
      '_OBJECT _PREP _OBJECT',
    ]);
    dict.set('_BAND', ['BAND', 'TRIO', 'QUARTET', '_NUMBER']);
  }

  getLine() {
    const form = this.lineForm[this.engine.pickIndex(this.lineForm.length)];
    const prep = { prob: 3, keepBelow: 2, bump: 4 };
    const expanded = this.engine.expand(form, {
      hooks: (token, chosen) => this.engine.applyGrammar(token, chosen, {
        adverbOnVerb: true,
        adjectiveNounLike: true,
        prep,
      }),
    });
    return this.engine.upper(this.engine.cleanup(expanded));
  }

  namedLine() {
    let name = this.getLine();
    while (name.length > 32 && this.engine.randInt(1, 10) > 1) {
      name = this.getLine();
    }
    return name.trim();
  }

  generate() {
    const background = `band/${this.engine.randInt(1, 14)}.jpg`;
    const headliner = this.namedLine();
    const guests = [];
    for (let count = 0; count < 7; count += 1) {
      guests.push(this.namedLine());
    }
    return { background, headliner, guests };
  }
}

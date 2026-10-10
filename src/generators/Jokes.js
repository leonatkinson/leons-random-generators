import forms from '../data/forms.js';
import { GeneratorEngine } from '../engine/GeneratorEngine.js';

export class Jokes {
  constructor(dictionary, rng) {
    this.engine = new GeneratorEngine(dictionary, rng);
    this.install();
  }

  install() {
    const dict = this.engine.dictionary;
    dict.append('_ARTICLE', ["_NOUN 'S", "THE _NOUN 'S", "A _NOUN 'S"]);
    dict.set('_MORELESS', ['MORE', 'LESS']);
    dict.set('_PUNCT', ['!', '.', '.', '.', '...']);
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
    ]);
    dict.set('_COMPOUNDNOUNPL', ['_NOUNPL', '_NOUNPL', '_NOUNPL', '_NOUNPL', '_NOUN - _NOUNPL']);
    dict.set('_SUBJECTPL', [
      '_COMPOUNDNOUNPL',
      '_ADJECTIVE _COMPOUNDNOUNPL',
      '_ARTICLE _COMPOUNDNOUNPL',
      '_ARTICLE _ADJECTIVE _COMPOUNDNOUNPL',
      '_NUMBER _COMPOUNDNOUNPL',
      '_ARTICLE _NUMBER _COMPOUNDNOUNPL',
      '_SUBJECT AND _SUBJECT',
      '_SUBJECTPL AND _SUBJECT',
      '_SUBJECT AND _SUBJECTPL',
      '_SUBJECTPL AND _SUBJECTPL',
      '_SUBJECTPL _PREP _OBJECT',
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
    ]);
  }

  getLine() {
    const form = this.lineForm[this.engine.pickIndex(this.lineForm.length)];
    const expanded = this.engine.expand(form, {
      hooks: (token, chosen) => this.engine.applyGrammar(token, chosen, {
        adverbOnVerb: true,
        adjectiveNounLike: true,
        prep: this.prep,
      }),
    });
    return this.engine.upper(this.engine.cleanup(expanded));
  }

  generate() {
    this.prep = { prob: 3, keepBelow: 1, bump: 2 };
    this.lineForm = ['_SUBJECT'];
    this.engine.dictionary.set('_OBJECT1', [this.getLine().trim()]);
    this.engine.dictionary.set('_OBJECT2', [this.getLine().trim()]);
    this.lineForm = ['_ADJECTIVE'];
    this.engine.dictionary.set('_PROPERTY1', [this.getLine().trim()]);
    this.engine.dictionary.set('_PROPERTY2', [this.getLine().trim()]);
    this.lineForm = ['_PERSON'];
    const author = `--${this.getLine().trim()} (${this.engine.pickIndex(2001)} CE)`;
    this.lineForm = forms.jokes;
    return {
      joke: this.getLine().trim(),
      author: author.toUpperCase(),
    };
  }
}

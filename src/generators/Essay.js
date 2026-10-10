import forms from '../data/forms.js';
import { GeneratorEngine } from '../engine/GeneratorEngine.js';

export class Essay {
  constructor(dictionary, rng) {
    this.engine = new GeneratorEngine(dictionary, rng);
    this.install();
    this.lineForm = forms.essay;
  }

  install() {
    const dict = this.engine.dictionary;
    dict.append('_ARTICLE', ["_NOUN 'S", "THE _NOUN 'S", "A _NOUN 'S"]);
    dict.append('_CONJUN', [
      'THEREFORE',
      'THUS',
      'WHICH PROVES',
      'PROVING THE FACT THAT',
      'REMEMBER THAT',
      'RECALL THAT',
    ]);
    dict.set('_MORELESS', ['MORE', 'LESS']);
    dict.set('_PUNCT', ['!', '.', '.', '.']);
    dict.set('_COMPOUNDNOUN', ['_NOUN', '_NOUN', '_NOUN', '_NOUN', '_NOUN - _NOUN']);
    dict.set('_SUBJECT', [
      '_COMPOUNDNOUN',
      '_ADJECTIVE _COMPOUNDNOUN',
      '_ARTICLE _COMPOUNDNOUN',
      '_ARTICLE _ADJECTIVE _COMPOUNDNOUN',
      '_SUBJECT _PREP _OBJECT',
      '_PERSON',
      '_NAME',
      'IT',
      'IT',
      'IT',
      'IT',
      'IT',
      'IT',
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
      '_SUBJECT AND _SUBJECT',
      '_SUBJECTPL AND _SUBJECT',
      '_SUBJECT AND _SUBJECTPL',
      '_SUBJECTPL AND _SUBJECTPL',
      '_SUBJECTPL _PREP _OBJECT',
      'THEY',
      'THEY',
      'THEY',
      'THEY',
      'THEY',
      'THEY',
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
      'THEM',
      'THEM',
      'THEM',
      'THEM',
      'THEM',
    ]);
  }

  resolveSubject() {
    let form = this.engine.pick('_SUBJECT');
    const expanded = this.engine.expand(form);
    return expanded.trim().replaceAll(' - ', '-');
  }

  getLine() {
    const prefix = this.engine.randInt(0, this.useConjun) === 0 ? '_CONJUN ' : '';
    if (prefix) {
      this.useConjun += 5;
    } else {
      this.useConjun -= 1;
      if (this.useConjun <= 0) {
        this.useConjun = 1;
      }
    }
    let form = this.lineForm[this.engine.pickIndex(this.lineForm.length)];
    let guard = 0;
    while (form.includes('_WHY') && this.engine.randInt(0, this.useWhy) > 1 && guard < 40) {
      form = this.lineForm[this.engine.pickIndex(this.lineForm.length)];
      guard += 1;
    }
    if (form.includes('_WHY')) {
      this.useWhy += 3;
    } else {
      this.useWhy -= 1;
      if (this.useWhy < 1) {
        this.useWhy = 1;
      }
    }
    let specialCount = 3;
    const prep = { prob: 1, keepBelow: 2, bump: 2 };
    const expanded = this.engine.expand(form, {
      prefix,
      hooks: (token, chosen) => {
        if (token === '_SUBJECT') {
          if (specialCount && this.engine.pickIndex(specialCount) === 0) {
            specialCount += 1;
            return '_SPECIALSUBJECT ';
          }
          specialCount -= 1;
          if (specialCount < 0) {
            specialCount = 0;
          }
          return chosen;
        }
        return this.engine.applyGrammar(token, chosen, {
          adverbOnVerb: true,
          adjectiveNounLike: true,
          prep,
        });
      },
    });
    return this.engine.upper(this.engine.cleanup(expanded));
  }

  generate() {
    const subjects = [];
    for (let i = 0; i < 4; i += 1) {
      subjects.push(this.resolveSubject());
    }
    this.engine.dictionary.set('_SPECIALSUBJECT', subjects);
    this.useWhy = 1;
    this.useConjun = 3;
    const listSize = (this.engine.pickIndex(7) + 8) * 2;
    const paragraphs = [[]];
    let justDidBreak = 0;
    for (let count = 0; count < listSize; count += 1) {
      if (count < 2 || count > listSize - 2 || this.engine.pickIndex(4) !== 0 || justDidBreak > 0) {
        justDidBreak -= 1;
        paragraphs[paragraphs.length - 1].push(this.engine.sentenceCase(this.getLine()).trim());
      } else {
        paragraphs.push([]);
        justDidBreak = 2;
      }
    }
    return {
      title: subjects[0].toUpperCase(),
      paragraphs: paragraphs.filter((paragraph) => paragraph.length).map((paragraph) => paragraph.join(' ')),
    };
  }
}

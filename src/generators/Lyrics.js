import forms from '../data/forms.js';
import { GeneratorEngine } from '../engine/GeneratorEngine.js';

export class Lyrics {
  constructor(dictionary, rng) {
    this.engine = new GeneratorEngine(dictionary, rng);
    this.install();
    this.lineForm = forms.lyrics;
    this.nameForm = forms.lyricsNames;
  }

  install() {
    const dict = this.engine.dictionary;
    dict.set('_PUNCT', ['?', '!', '.', '.', '.', '...']);
    dict.append('_ARTICLE', ["_NOUN 'S", "THE _NOUN 'S", "A _NOUN 'S"]);
    dict.set('_COMPOUNDNOUN', ['_NOUN', '_NOUN', '_NOUN', '_NOUN', '_NOUN - _NOUN']);
    dict.set('_MORELESS', ['MORE', 'LESS']);
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
    ]);
  }

  lineHooks(token, chosen, prep) {
    if (token === '_NOUN') {
      if (this.specialCount && (this.engine.randInt(1, 10) % this.specialCount === 0)) {
        this.specialCount += 3;
        return '_SPECIALNOUN ';
      }
      this.specialCount -= 2;
      if (this.specialCount < 0) {
        this.specialCount = 0;
      }
      return chosen;
    }
    if (token === '_SUBJECT') {
      if (this.specialCount && this.engine.pickIndex(this.specialCount) === 0) {
        this.specialCount += 3;
        return '_SPECIALSUBJECT ';
      }
      this.specialCount -= 2;
      if (this.specialCount < 0) {
        this.specialCount = 0;
      }
      return chosen;
    }
    return this.engine.applyGrammar(token, chosen, {
      adverbOnVerb: true,
      adjectiveNounLike: true,
      prep,
    });
  }

  getLine() {
    const prefix = this.engine.randInt(0, 3) === 0 ? '_CONJUN ' : '';
    let form = this.lineForm[this.engine.pickIndex(this.lineForm.length)];
    let guard = 0;
    while (form.includes('_WHY') && this.engine.randInt(0, this.useWhy) > 1 && guard < 40) {
      form = this.lineForm[this.engine.pickIndex(this.lineForm.length)];
      guard += 1;
    }
    if (form.includes('_WHY')) {
      this.useWhy += 2;
    } else {
      this.useWhy -= 1;
      if (this.useWhy < 1) {
        this.useWhy = 1;
      }
    }
    this.specialCount = 3;
    const prep = { prob: 1, keepBelow: 2, bump: 2 };
    const expanded = this.engine.expand(form, {
      prefix,
      hooks: (token, chosen) => this.lineHooks(token, chosen, prep),
    });
    return this.engine.upper(this.engine.cleanup(expanded));
  }

  resolveSubject() {
    let specialCount = 5;
    let form = this.engine.pick('_SUBJECT');
    let guard = 0;
    while (form.includes('_') && guard < 40) {
      let sentence = '';
      for (const token of form.split(' ')) {
        if (token === '') {
          continue;
        }
        if (token.startsWith('_')) {
          let chosen = `${this.engine.pick(token)} `;
          if (token === '_NOUN') {
            if (specialCount && this.engine.pickIndex(specialCount) === 0) {
              specialCount += 5;
              chosen = '_SPECIALNOUN ';
            } else {
              specialCount -= 2;
              if (specialCount < 0) {
                specialCount = 0;
              }
            }
          }
          sentence += chosen;
        } else {
          sentence += `${token} `;
        }
      }
      form = sentence;
      guard += 1;
    }
    return { text: form.trim(), specialCount };
  }

  titleFrom(form) {
    let title = '';
    for (const token of form.split(' ')) {
      if (token === '') {
        continue;
      }
      if (token.startsWith('_')) {
        let chosen = `${this.engine.pick(token)} `;
        if (token === '_NOUN' && this.titleSpecialCount === 1) {
          this.titleSpecialCount += 1;
          chosen = ' ';
        }
        title += chosen;
      } else {
        title += `${token} `;
      }
    }
    return this.engine.cleanup(title);
  }

  generate() {
    const nouns = [];
    for (let i = 0; i < 4; i += 1) {
      nouns.push(this.engine.pick('_NOUN'));
    }
    this.engine.dictionary.set('_SPECIALNOUN', nouns);
    const subject = this.resolveSubject();
    this.titleSpecialCount = subject.specialCount;
    this.engine.dictionary.set('_SPECIALSUBJECT', [subject.text]);
    const title = this.titleFrom(this.nameForm[this.engine.pickIndex(this.nameForm.length)]);
    this.useWhy = 1;
    const listSize = (this.engine.pickIndex(7) + 8) * 2;
    const lines = [];
    let justDidBreak = 0;
    for (let count = 0; count < listSize; count += 1) {
      if (count < 2 || count > listSize - 2 || this.engine.pickIndex(4) !== 0 || justDidBreak > 0) {
        justDidBreak -= 1;
        lines.push(this.engine.sentenceCase(this.getLine()).trim());
      } else {
        lines.push('');
        justDidBreak = 2;
      }
    }
    return {
      title: this.engine.titleCase(title).trim(),
      lines,
    };
  }
}

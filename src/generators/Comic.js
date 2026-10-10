import forms from '../data/forms.js';
import { GeneratorEngine } from '../engine/GeneratorEngine.js';

const CHARACTERS = [
  null,
  { name: 'leon', max: 4 },
  { name: 'fatty', max: 4 },
  { name: 'girl', max: 4 },
  { name: 'smarty', max: 4 },
  { name: 'dude', max: 4 },
  { name: 'sam', max: 6 },
  { name: 'andrew', max: 4 },
  { name: 'janet', max: 4 },
  { name: 'paco', max: 4 },
  { name: 'pres', max: 4 },
  { name: 'headface', max: 4 },
  { name: 'evilheadface', max: 4 },
];

export class Comic {
  constructor(dictionary, rng) {
    this.engine = new GeneratorEngine(dictionary, rng);
    this.install();
    this.lineForm = forms.comic;
  }

  install() {
    const dict = this.engine.dictionary;
    dict.set('_PUNCT', ['?', '!', '.', '.', '.', '...']);
    dict.append('_ARTICLE', ["_NOUN 'S", "THE _NOUN 'S", "A _NOUN 'S"]);
    dict.set('_MORELESS', ['MORE', 'LESS']);
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
  }

  chooseLCR() {
    return ['left', 'center', 'right'][this.engine.randInt(1, 3) - 1];
  }

  chooseCharacter(used) {
    let roll = this.engine.randInt(1, 11);
    while (roll <= 12) {
      if (!used[roll]) {
        used[roll] = true;
        const character = CHARACTERS[roll];
        return `${character.name}${this.engine.randInt(1, character.max)}.gif`;
      }
      roll += 1;
    }
    return `slim${this.engine.randInt(1, 4)}.gif`;
  }

  chooseOccupant(used) {
    const roll = this.engine.randInt(1, 5);
    if (roll === 1) {
      return this.chooseCharacter(used);
    }
    if (roll === 2) {
      return `thing${this.engine.randInt(1, 7)}.gif`;
    }
    return 'clear.gif';
  }

  chooseColor() {
    const channel = () => ['FF', 'CC', '99'][this.engine.randInt(1, 3) - 1];
    return `${channel()}${channel()}${channel()}`;
  }

  getLine() {
    let form;
    let prefix = '';
    if (this.lastQuestion === '') {
      form = this.lineForm[this.engine.pickIndex(this.lineForm.length)];
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
        if (this.engine.randInt(0, 4) === 0) {
          prefix = '_CONJUN ';
        } else if (this.engine.randInt(0, 3) === 0) {
          prefix = '_INTERJECTION _PUNCT ';
        }
      }
    } else {
      form = this.lineForm[this.engine.pickIndex(this.lineForm.length)];
      let guard = 0;
      while (form.includes('_WHY') && guard < 40) {
        form = this.lineForm[this.engine.pickIndex(this.lineForm.length)];
        guard += 1;
      }
      switch (this.lastQuestion) {
        case 'WHY':
        case 'FOR WHAT REASON':
          form = `BECAUSE ${form}`;
          break;
        case 'WHAT':
        case 'WHO':
          form = '_OBJECT _PUNCT';
          break;
        case 'HOW':
          form = this.engine.randInt(0, 1) === 0 ? 'VERY _ADVERB _PUNCT' : '_PREP _OBJECT _PUNCT';
          break;
        case 'WHEN':
          form = `WHEN ${form}`;
          break;
        default:
          break;
      }
    }
    this.lastQuestion = '';
    let specialCount = 3;
    const prep = { prob: 1, keepBelow: 2, bump: 2 };
    const expanded = this.engine.expand(form, {
      prefix,
      hooks: (token, chosen) => {
        if (token === '_WHY' || token === '_WHAT') {
          this.lastQuestion = chosen.trim().toUpperCase();
        }
        if (token === '_NOUN') {
          if (specialCount && this.engine.pickIndex(specialCount) === 0) {
            specialCount += 2;
            return `${this.specialNoun} `;
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
    return this.engine.upper(this.engine.cleanup(expanded)).trim();
  }

  generate() {
    this.specialNoun = this.engine.pick('_NOUN');
    this.useWhy = 1;
    this.lastQuestion = '';
    const colors = [this.chooseColor(), this.chooseColor(), this.chooseColor()];
    const speakers = [this.chooseLCR(), this.chooseLCR(), this.chooseLCR()];
    const panes = [];
    for (let pane = 0; pane < 3; pane += 1) {
      const speaker = speakers[pane];
      const text = this.getLine();
      const used = {};
      const cells = [];
      for (let cell = 0; cell < 3; cell += 1) {
        const speaking = (cell === 0 && speaker === 'left')
          || (cell === 1 && speaker === 'center')
          || (cell === 2 && speaker === 'right');
        cells.push(speaking ? this.chooseCharacter(used) : this.chooseOccupant(used));
      }
      panes.push({
        color: colors[pane],
        speaker,
        text,
        cells,
      });
    }
    return {
      title: this.specialNoun.toUpperCase(),
      panes,
    };
  }
}

import { GeneratorEngine } from '../engine/GeneratorEngine.js';
import { Dictionary } from '../engine/Dictionary.js';

const NOTES = [
  'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B',
  'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B',
];

const STRUCTURES = [
  '1 2 1 2 ',
  '1 2 3 1 2 3 ',
  '1 2 1 2 3 2',
  '1 2 1 2 3 1 2',
  '1 2 3 1 2 3 4 3',
];

const PROGRESSIONS = [
  'I I V V I I IV IV I I V V I IV I V ',
  'I I IV IV V V I I ',
  'I I I I IV IV V V ',
  'I I VI VI IV IV V V ',
  'I I VI VI II II V V ',
  'I I II II IV IV V V ',
  'I I II II VI VI V V ',
  'I I III III II II V V ',
  'I I III III VI VI V V ',
  'I I III III IV IV V V ',
  'I IV I VI I IV I VI ',
  'V V V IV V V IV I ',
  'I I VI VI I I VI VI ',
  'I I IV IV I I IV IV ',
  'III I II III III I II III ',
  'I II V II III I I II ',
  'V I I II IV IV III III ',
  'I IV I IV I III IV I ',
  'V II VII VI VI IV IV ',
  'I I II II V V V V',
  'I I V V I I V V ',
  'IV IV I I V V I I ',
];

export class ChordProgression {
  constructor(dictionary, rng) {
    this.engine = new GeneratorEngine(dictionary || new Dictionary({}), rng);
  }

  generate() {
    const key = this.engine.randInt(0, 23);
    const chord = {
      I: NOTES[key],
      II: NOTES[(key + 2) % 24],
      III: NOTES[(key + 4) % 24],
      IV: NOTES[(key + 5) % 24],
      V: NOTES[(key + 7) % 24],
      VI: NOTES[(key + 9) % 24],
      VII: NOTES[(key + 11) % 24],
    };
    const parts = [];
    for (let i = 0; i < 4; i += 1) {
      let song = '';
      const progression = PROGRESSIONS[this.engine.pickIndex(PROGRESSIONS.length)];
      for (const bar of progression.split(' ')) {
        if (!bar) {
          continue;
        }
        song += chord[bar];
        if ((bar === 'II' || bar === 'III' || bar === 'VI') && this.engine.randInt(1, 10) < 5) {
          song += 'm';
        } else if (this.engine.randInt(0, 100) < 5) {
          song += 'm';
        }
        if (bar === 'V' && this.engine.randInt(1, 10) < 5) {
          song += '7';
        } else if (this.engine.randInt(0, 100) < 5) {
          song += '7';
        }
        song += ' ';
      }
      parts.push(song);
    }
    const structureIndex = this.engine.randInt(1, STRUCTURES.length - 1);
    const lines = STRUCTURES[structureIndex].trim().split(/\s+/).map((slot) => parts[Number(slot)] || '');
    return {
      key: NOTES[key],
      structureIndex,
      lines,
    };
  }
}

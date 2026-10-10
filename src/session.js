import { Dictionary, weightDictionary } from './engine/Dictionary.js';
import { Advice } from './generators/Advice.js';
import { AlbumCover } from './generators/AlbumCover.js';
import { BandNames } from './generators/BandNames.js';
import { ChordProgression } from './generators/ChordProgression.js';
import { Comic } from './generators/Comic.js';
import { Essay } from './generators/Essay.js';
import { Jokes } from './generators/Jokes.js';
import { Lyrics } from './generators/Lyrics.js';
import { Translator } from './generators/Translator.js';

export const GENERATORS = [
  'band',
  'album',
  'lyrics',
  'song',
  'jokes',
  'advice',
  'essay',
  'comic',
  'translate',
];

export function createSession(rawDictionary, rng = Math.random) {
  const weighted = weightDictionary(rawDictionary, rng);
  const dict = () => new Dictionary(weighted);
  return {
    band: new BandNames(dict(), rng),
    album: new AlbumCover(dict(), rng),
    lyrics: new Lyrics(dict(), rng),
    song: new ChordProgression(dict(), rng),
    jokes: new Jokes(dict(), rng),
    advice: new Advice(dict(), rng),
    essay: new Essay(dict(), rng),
    comic: new Comic(dict(), rng),
    translate: new Translator(rawDictionary, rng),
  };
}

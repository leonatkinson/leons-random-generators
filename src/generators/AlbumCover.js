import { BandPhrase } from './BandPhrase.js';

function solidColor(engine) {
  let color = '#';
  for (let i = 0; i < 6; i += 1) {
    color += engine.randInt(0, 15).toString(16);
  }
  return color;
}

export class AlbumCover {
  constructor(dictionary, rng) {
    this.phrase = new BandPhrase(dictionary, rng);
    this.engine = this.phrase.engine;
  }

  generate() {
    return {
      artist: this.phrase.getName(),
      title: this.phrase.getName(),
      textColor: [0, 1, 2].map(() => this.engine.randInt(7, 15).toString(16)).join(''),
      background: solidColor(this.engine),
      src: null,
      pageUrl: null,
    };
  }
}
